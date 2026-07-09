'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Plus, X, Clock } from 'lucide-react'

export default function AgendaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    cliente: '',
    servico: '',
    horario: '09:00',
    duracao: '30',
    preco: '0',
    notas: '',
  })

  useEffect(() => {
    const session = localStorage.getItem('salon_session')
    if (!session) {
      router.push('/sign-in')
      return
    }

    const sessionData = JSON.parse(session)
    setUser(sessionData)

    // Buscar agendamentos de duas fontes: salon_users e owner_accounts
    let allAppointments: any[] = []

    // Buscar em salon_users (agendamentos criados pelo funcionário)
    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userData = users.find((u: any) => u.id === sessionData.userId)
    if (userData?.salon?.appointments) {
      allAppointments = [...userData.salon.appointments]
    }

    // Buscar em owner_accounts (agendamentos feitos por clientes)
    const ownerAccounts = JSON.parse(localStorage.getItem('owner_accounts') || '[]')
    const ownerAccount = ownerAccounts.find((acc: any) => acc.salonId === sessionData.salonId)
    if (ownerAccount?.salon?.appointments) {
      // Mesclar e evitar duplicatas
      allAppointments = [
        ...allAppointments,
        ...ownerAccount.salon.appointments.filter(
          (apt: any) => !allAppointments.find((a) => a.id === apt.id)
        ),
      ]
    }

    setAppointments(allAppointments)
  }, [router])

  const handleAddAppointment = () => {
    if (!formData.cliente || !formData.servico) {
      alert('Preencha cliente e serviço')
      return
    }

    const newAppointment = {
      id: 'apt_' + Date.now(),
      data: selectedDate,
      ...formData,
      status: 'agendado',
      criado_em: new Date().toISOString(),
    }

    setAppointments([...appointments, newAppointment])

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex].salon.appointments = [...appointments, newAppointment]
      localStorage.setItem('salon_users', JSON.stringify(users))
    }

    setFormData({
      cliente: '',
      servico: '',
      horario: '09:00',
      duracao: '30',
      preco: '0',
      notas: '',
    })
    setShowForm(false)
  }

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter((a) => a.id !== id)
    setAppointments(updated)

    // Remover de salon_users
    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex].salon.appointments = updated.filter((a) => {
        // Verificar se era do salon_users original
        const originalApts = users[userIndex].salon.appointments || []
        return originalApts.find((apt: any) => apt.id === a.id)
      })
      localStorage.setItem('salon_users', JSON.stringify(users))
    }

    // Remover de owner_accounts também
    const ownerAccounts = JSON.parse(localStorage.getItem('owner_accounts') || '[]')
    const ownerIndex = ownerAccounts.findIndex((acc: any) => acc.salonId === user.salonId)
    if (ownerIndex >= 0 && ownerAccounts[ownerIndex].salon?.appointments) {
      ownerAccounts[ownerIndex].salon.appointments = ownerAccounts[ownerIndex].salon.appointments.filter(
        (apt: any) => apt.id !== id
      )
      localStorage.setItem('owner_accounts', JSON.stringify(ownerAccounts))
    }
  }

  const appointmentsForDate = appointments.filter((a) => a.data === selectedDate)
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
  const currentDate = new Date(selectedDate)
  const days = []
  const firstDay = firstDayOfMonth(currentDate)
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth(currentDate); i++) {
    days.push(i)
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agenda</h1>
            <p className="text-muted-foreground mt-1">Gerencie os horários e marcações</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={20} />
            Nova Marcação
          </Button>
        </div>

        {showForm && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Adicionar Agendamento</CardTitle>
              <button onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente</label>
                <Input
                  placeholder="Nome do cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Serviço</label>
                <Input
                  placeholder="Tipo de serviço"
                  value={formData.servico}
                  onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Horário</label>
                  <Input
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duração (min)</label>
                  <Input
                    type="number"
                    value={formData.duracao}
                    onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <Input
                  placeholder="Observações..."
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                />
              </div>

              <Button onClick={handleAddAppointment} className="w-full">
                Confirmar Agendamento
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {weekDays.map((day) => (
                    <div key={day} className="font-semibold p-2">
                      {day}
                    </div>
                  ))}
                  {days.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => day && setSelectedDate(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                      className={`p-2 rounded transition-colors ${
                        day
                          ? selectedDate.includes(String(day).padStart(2, '0'))
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'hover:bg-accent'
                          : ''
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agendamentos do Dia */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {appointmentsForDate.length > 0
                    ? `${new Date(selectedDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}`
                    : 'Nenhum agendamento'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {appointmentsForDate.length} marcação(ções)
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointmentsForDate.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">Nenhum agendamento para este dia</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-primary hover:underline text-sm mt-2"
                    >
                      Criar nova marcação
                    </button>
                  </div>
                ) : (
                  appointmentsForDate.map((apt) => (
                    <Card key={apt.id} className="bg-accent/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock size={16} className="text-primary" />
                              <span className="font-semibold">{apt.horario}</span>
                              <span className="text-xs text-muted-foreground">({apt.duracao} min)</span>
                            </div>
                            <p className="font-medium">{apt.cliente}</p>
                            <p className="text-sm text-muted-foreground">{apt.servico}</p>
                            <p className="text-sm font-semibold text-primary">R$ {parseFloat(apt.preco).toFixed(2)}</p>
                            {apt.notas && <p className="text-xs text-muted-foreground mt-1">{apt.notas}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
