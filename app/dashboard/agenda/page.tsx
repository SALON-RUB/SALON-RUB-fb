'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  getAppointmentsBySalonId,
  getServicesBySalonId,
  getEmployeesBySalonId,
  getClientsBySalonId,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableTimeSlots,
  formatCurrency,
  getOrCreateClient,
  createTransaction
} from '@/lib/store'
import type { Appointment, Service, Employee, Client } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Check,
  X,
  Trash2,
  Menu,
  LayoutDashboard,
  Scissors,
  DollarSign,
  Users,
  Key,
  Settings,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MONTHS_PT = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export default function AgendaPage() {
  const { isAuthenticated, userRole, salon, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day
    return new Date(now.setDate(diff))
  })
  
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [filterEmployee, setFilterEmployee] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: '',
    employeeId: '',
    date: '',
    time: ''
  })

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'owner') {
      router.push('/')
      return
    }

    if (salon) {
      loadData()
    }

    if (searchParams.get('new') === 'true') {
      setShowNewModal(true)
    }
  }, [isAuthenticated, userRole, salon, router, searchParams])

  const loadData = () => {
    if (!salon) return
    setAppointments(getAppointmentsBySalonId(salon.id))
    setServices(getServicesBySalonId(salon.id))
    setEmployees(getEmployeesBySalonId(salon.id))
  }

  if (!isAuthenticated || userRole !== 'owner' || !salon) {
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
  
  const filteredAppointments = appointments.filter(a => {
    if (a.date !== selectedDateStr) return false
    if (filterEmployee !== 'all' && a.employeeId !== filterEmployee) return false
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    return true
  }).sort((a, b) => a.time.localeCompare(b.time))

  const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof salon.businessHours
  const businessHours = salon.businessHours[dayOfWeek]

  const handleCreateAppointment = () => {
    if (!newAppointment.clientName || !newAppointment.clientPhone || !newAppointment.serviceId || !newAppointment.date || !newAppointment.time) {
      return
    }

    const service = services.find(s => s.id === newAppointment.serviceId)
    if (!service) return

    const employee = employees.find(e => e.id === newAppointment.employeeId)
    const client = getOrCreateClient(salon.id, newAppointment.clientName, newAppointment.clientPhone)

    createAppointment({
      salonId: salon.id,
      clientId: client.id,
      clientName: newAppointment.clientName,
      clientPhone: newAppointment.clientPhone,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      employeeId: employee?.id || null,
      employeeName: employee?.name || null,
      date: newAppointment.date,
      time: newAppointment.time
    })

    setShowNewModal(false)
    setNewAppointment({ clientName: '', clientPhone: '', serviceId: '', employeeId: '', date: '', time: '' })
    loadData()
  }

  const handleStatusChange = (appointment: Appointment, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    updateAppointment(appointment.id, { status: newStatus })
    
    if (newStatus === 'completed') {
      createTransaction({
        salonId: salon.id,
        appointmentId: appointment.id,
        type: 'income',
        category: 'Servico',
        description: `${appointment.serviceName} - ${appointment.clientName}`,
        amount: appointment.servicePrice,
        date: appointment.date,
        employeeId: appointment.employeeId,
        employeeName: appointment.employeeName
      })
    }
    
    setSelectedAppointment(null)
    loadData()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      deleteAppointment(id)
      setSelectedAppointment(null)
      loadData()
    }
  }

  const availableSlots = newAppointment.date ? getAvailableTimeSlots(salon, newAppointment.date, newAppointment.employeeId || undefined) : []

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda', active: true },
    { icon: Scissors, label: 'Servicos', href: '/dashboard/servicos' },
    { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
    { icon: Users, label: 'Equipe', href: '/dashboard/equipe' },
    { icon: Key, label: 'Codigo do Salao', href: '/dashboard/codigo' },
    { icon: Settings, label: 'Configuracoes', href: '/dashboard/configuracoes' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-secondary rounded-lg lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">
              <span className="text-primary">Salao</span> <span className="text-foreground">Pro</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 lg:hidden">
              <h1 className="text-xl font-bold"><span className="text-primary">Salao</span> <span className="text-foreground">Pro</span></h1>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.active ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`} onClick={() => setSidebarOpen(false)}>
                  <item.icon className="w-5 h-5" /><span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-border">
              <button onClick={() => { logout(); router.push('/') }} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <LogOut className="w-5 h-5" /><span>Sair</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Agenda</h2>
                <p className="text-muted-foreground">Gerencie os horarios e marcacoes</p>
              </div>
            </div>

            <Button onClick={() => { setNewAppointment({ ...newAppointment, date: selectedDateStr }); setShowNewModal(true) }} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Nova Marcacao
            </Button>

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
                    const isToday = dateStr === new Date().toISOString().split('T')[0]
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

            {/* Business Hours */}
            {businessHours && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-primary">
                    Horario de Funcionamento — {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                    {businessHours.open ? ` Aberto das ${businessHours.start} as ${businessHours.end}` : ' Fechado'}
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger className="w-full bg-card border-border">
                  <SelectValue placeholder="Toda a equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda a equipe</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full bg-card border-border">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Appointments List */}
            <Card className="light bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</CardTitle>
                  <span className="text-muted-foreground ml-auto">{filteredAppointments.length} marcacoes</span>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum agendamento para este dia</p>
                    <Button variant="link" className="text-primary mt-2" onClick={() => { setNewAppointment({ ...newAppointment, date: selectedDateStr }); setShowNewModal(true) }}>
                      Criar nova marcacao
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map(apt => (
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
                            {apt.employeeName && <p className="text-xs text-muted-foreground">com {apt.employeeName}</p>}
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
          </div>
        </main>
      </div>

      {/* New Appointment Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nova Marcacao</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Cliente</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome completo"
                  value={newAppointment.clientName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="(11) 99999-9999"
                  value={newAppointment.clientPhone}
                  onChange={(e) => setNewAppointment({ ...newAppointment, clientPhone: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Servico</Label>
              <Select value={newAppointment.serviceId} onValueChange={(v) => setNewAppointment({ ...newAppointment, serviceId: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione o servico" />
                </SelectTrigger>
                <SelectContent>
                  {services.filter(s => s.active).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Profissional (opcional)</Label>
              <Select value={newAppointment.employeeId} onValueChange={(v) => setNewAppointment({ ...newAppointment, employeeId: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Qualquer disponivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer disponivel</SelectItem>
                  {employees.filter(e => e.active).map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value, time: '' })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Horario</Label>
              <Select value={newAppointment.time} onValueChange={(v) => setNewAppointment({ ...newAppointment, time: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione o horario" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newAppointment.date && availableSlots.length === 0 && (
                <p className="text-sm text-destructive">Nenhum horario disponivel nesta data</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateAppointment}>Criar Marcacao</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                {selectedAppointment.employeeName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profissional</span>
                    <span className="font-medium">{selectedAppointment.employeeName}</span>
                  </div>
                )}
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

              <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={() => handleDelete(selectedAppointment.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Excluir Agendamento
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
