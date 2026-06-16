'use client'

import { useState, useEffect, useTransition } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Phone, CheckCircle, XCircle } from 'lucide-react'
import { getAppointmentsBySalon, updateAppointmentStatus } from '@/app/actions/appointments'

export default function AgendamentosPage() {
  const [isPending, startTransition] = useTransition()
  const [appointments, setAppointments] = useState<any[]>([])
  const [filter, setFilter] = useState<'todos' | 'agendado' | 'concluido' | 'cancelado'>('todos')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const data = await getAppointmentsBySalon()
      setAppointments(data)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    }
  }

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateAppointmentStatus(appointmentId, newStatus)
        await loadAppointments()
      } catch (error) {
        console.error('Erro ao atualizar agendamento:', error)
      }
    })
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'todos') return true
    return apt.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800'
      case 'concluido':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelado':
        return <XCircle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Agendamentos</h1>
              <p className="text-muted-foreground">Gerencie os agendamentos dos clientes</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {(['todos', 'agendado', 'concluido', 'cancelado'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status === 'todos' && 'Todos'}
              {status === 'agendado' && 'Agendados'}
              {status === 'concluido' && 'Concluídos'}
              {status === 'cancelado' && 'Cancelados'}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold">{appointment.clientName}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusIcon(appointment.status)}
                          {appointment.status === 'agendado' && 'Agendado'}
                          {appointment.status === 'concluido' && 'Concluído'}
                          {appointment.status === 'cancelado' && 'Cancelado'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.clientPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-primary">
                            R$ {parseFloat(appointment.price).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {appointment.service && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Serviço: {appointment.service.name} ({appointment.duration} min)
                        </p>
                      )}

                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Observações: {appointment.notes}
                        </p>
                      )}
                    </div>

                    {appointment.status === 'agendado' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, 'concluido')}
                          disabled={isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(appointment.id, 'cancelado')}
                          disabled={isPending}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
