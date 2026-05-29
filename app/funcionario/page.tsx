'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  getAppointmentsBySalonId,
  getTransactionsBySalonId,
  updateAppointment,
  createTransaction,
  formatCurrency
} from '@/lib/store'
import type { Appointment, Transaction } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Calendar,
  DollarSign,
  LogOut,
  Scissors,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  User
} from 'lucide-react'

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MONTHS_PT = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export default function FuncionarioPage() {
  const { isAuthenticated, userRole, salon, employee, logout } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'agenda' | 'faturamento'>('agenda')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day
    return new Date(now.setDate(diff))
  })
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'employee') {
      router.push('/')
      return
    }

    if (salon) {
      loadData()
    }
  }, [isAuthenticated, userRole, salon, router])

  const loadData = () => {
    if (!salon || !employee) return
    const allAppointments = getAppointmentsBySalonId(salon.id)
    setAppointments(allAppointments.filter(a => a.employeeId === employee.id || !a.employeeId))
    setTransactions(getTransactionsBySalonId(salon.id).filter(t => t.employeeId === employee.id))
  }

  if (!isAuthenticated || userRole !== 'employee' || !salon || !employee) {
    return null
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return date
  })

  const navigateWeek = (direction: number) => {
    const newStart = new Date(weekStart)
    newStart.setDate(weekStart.getDate() + (direction * 7))
    setWeekStart(newStart)
  }

  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => a.date === selectedDateStr && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time))

  const today = new Date().toISOString().split('T')[0]
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const todayEarnings = transactions.filter(t => t.date === today && t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const monthEarnings = transactions.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && t.type === 'income'
  }).reduce((sum, t) => sum + t.amount, 0)

  const handleStatusChange = (appointment: Appointment, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    updateAppointment(appointment.id, { status: newStatus })
    
    if (newStatus === 'completed' && employee) {
      createTransaction({
        salonId: salon.id,
        appointmentId: appointment.id,
        type: 'income',
        category: 'Servico',
        description: `${appointment.serviceName} - ${appointment.clientName}`,
        amount: appointment.servicePrice,
        date: appointment.date,
        employeeId: employee.id,
        employeeName: employee.name
      })
    }
    
    setSelectedAppointment(null)
    loadData()
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-primary">Salao</span>{' '}
              <span className="text-foreground">Pro</span>
            </h1>
            <p className="text-sm text-muted-foreground">{salon.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{employee.name}</p>
              <p className="text-xs text-muted-foreground">Equipe</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-border">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'agenda' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4 inline-block mr-2" />
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('faturamento')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'faturamento' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className="w-4 h-4 inline-block mr-2" />
            Faturamento
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        {activeTab === 'agenda' ? (
          <>
            {/* Week Navigation */}
            <Card className="light bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-secondary rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-medium">
                    {weekDays[0].getDate()} de {MONTHS_PT[weekDays[0].getMonth()].slice(0, 3)}. - {weekDays[6].getDate()} de {MONTHS_PT[weekDays[6].getMonth()].slice(0, 3)}. de {weekDays[6].getFullYear()}
                  </span>
                  <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-secondary rounded-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const isSelected = dateStr === selectedDateStr
                    const isToday = dateStr === today
                    const dayAppointments = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled')
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                          isSelected ? 'bg-primary text-primary-foreground' : 
                          isToday ? 'bg-primary/20 text-primary' : 
                          'hover:bg-secondary'
                        }`}
                      >
                        <span className="text-xs">{DAYS_PT[date.getDay()]}</span>
                        <span className="text-lg font-bold">{date.getDate()}</span>
                        {dayAppointments.length > 0 && (
                          <span className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {dayAppointments.length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card className="light bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <CardTitle>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</CardTitle>
                  <span className="text-muted-foreground ml-auto">{todayAppointments.length} marcacoes</span>
                </div>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum agendamento para este dia</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map(apt => (
                      <div 
                        key={apt.id} 
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <p className="text-xl font-bold text-foreground">{apt.time}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{apt.clientName}</p>
                            <p className="text-sm text-muted-foreground">{apt.serviceName} • {formatCurrency(apt.servicePrice)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'completed' ? 'bg-[oklch(0.7_0.18_145)]/20 text-[oklch(0.7_0.18_145)]' :
                          apt.status === 'confirmed' ? 'bg-primary/20 text-primary' :
                          apt.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                          'bg-[oklch(0.8_0.15_85)]/20 text-[oklch(0.6_0.15_85)]'
                        }`}>
                          {apt.status === 'completed' ? 'Concluido' : 
                           apt.status === 'confirmed' ? 'Confirmado' : 
                           apt.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Earnings Summary */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="light bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Hoje</p>
                      <p className="text-2xl font-bold text-[oklch(0.7_0.18_145)]">{formatCurrency(todayEarnings)}</p>
                    </div>
                    <div className="w-10 h-10 bg-[oklch(0.7_0.18_145)]/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[oklch(0.7_0.18_145)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="light bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Este Mes</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(monthEarnings)}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="light bg-card">
              <CardHeader>
                <CardTitle>Historico de Atendimentos</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum atendimento concluido ainda</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 20).map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium">{t.description}</p>
                          <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className="font-bold text-[oklch(0.7_0.18_145)]">+{formatCurrency(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium">{selectedAppointment.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefone</span>
                  <span className="font-medium">{selectedAppointment.clientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servico</span>
                  <span className="font-medium">{selectedAppointment.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-medium text-primary">{formatCurrency(selectedAppointment.servicePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data/Hora</span>
                  <span className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString('pt-BR')} as {selectedAppointment.time}</span>
                </div>
              </div>

              {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                <div className="flex gap-2">
                  {selectedAppointment.status === 'pending' && (
                    <Button className="flex-1" onClick={() => handleStatusChange(selectedAppointment, 'confirmed')}>
                      <Check className="w-4 h-4 mr-2" /> Confirmar
                    </Button>
                  )}
                  <Button variant="default" className="flex-1 bg-[oklch(0.7_0.18_145)] hover:bg-[oklch(0.65_0.18_145)]" onClick={() => handleStatusChange(selectedAppointment, 'completed')}>
                    <Check className="w-4 h-4 mr-2" /> Concluir
                  </Button>
                  <Button variant="destructive" onClick={() => handleStatusChange(selectedAppointment, 'cancelled')}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
