'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  getAppointmentsBySalonId, 
  getServicesBySalonId, 
  getEmployeesBySalonId,
  getTransactionsBySalonId,
  getClientsBySalonId,
  formatCurrency 
} from '@/lib/store'
import type { Appointment, Service, Employee, Transaction } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  DollarSign, 
  Users, 
  Key, 
  Settings, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  ChevronRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { isAuthenticated, userRole, salon, logout, userName } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [clientCount, setClientCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'owner') {
      router.push('/')
      return
    }

    if (salon) {
      setAppointments(getAppointmentsBySalonId(salon.id))
      setServices(getServicesBySalonId(salon.id))
      setEmployees(getEmployeesBySalonId(salon.id))
      setTransactions(getTransactionsBySalonId(salon.id))
      setClientCount(getClientsBySalonId(salon.id).length)
    }
  }, [isAuthenticated, userRole, salon, router])

  if (!isAuthenticated || userRole !== 'owner' || !salon) {
    return null
  }

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled')
  const completedToday = todayAppointments.filter(a => a.status === 'completed')
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  
  const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const monthExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  
  const todayIncome = transactions
    .filter(t => t.date === today && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const activeServices = services.filter(s => s.active).length

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
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
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-secondary rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">
              <span className="text-primary">Salon</span>{' '}
              <span className="text-foreground">Rub</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 lg:hidden">
              <h1 className="text-xl font-bold">
                <span className="text-primary">Salon</span>{' '}
                <span className="text-foreground">Rub</span>
              </h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">
                {salon.name} — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Monthly Revenue Banner */}
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">
                  Faturamento do mes: {formatCurrency(monthIncome)}
                </span>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="light bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                      <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
                      <p className="text-xs text-muted-foreground">{completedToday.length} concluidos</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="light bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
                      <p className="text-2xl font-bold text-[oklch(0.7_0.18_145)]">{formatCurrency(todayIncome)}</p>
                      <p className="text-xs text-muted-foreground">Receita do dia</p>
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
                      <p className="text-sm text-muted-foreground">Servicos Ativos</p>
                      <p className="text-2xl font-bold text-foreground">{activeServices}</p>
                      <p className="text-xs text-muted-foreground">{services.length} total</p>
                    </div>
                    <div className="w-10 h-10 bg-[oklch(0.6_0.2_45)]/20 rounded-lg flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-[oklch(0.6_0.2_45)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="light bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Equipe</p>
                      <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                      <p className="text-xs text-muted-foreground">Membros cadastrados</p>
                    </div>
                    <div className="w-10 h-10 bg-[oklch(0.65_0.2_200)]/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-[oklch(0.65_0.2_200)]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <Card className="light bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Agenda de Hoje</CardTitle>
                </div>
                <Link href="/dashboard/agenda" className="text-primary text-sm font-medium flex items-center gap-1">
                  Ver agenda <ChevronRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhum agendamento para hoje</p>
                ) : (
                  <div className="space-y-2">
                    {todayAppointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[50px]">
                            <p className="font-bold text-foreground">{apt.time}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{apt.clientName}</p>
                            <p className="text-sm text-muted-foreground">{apt.serviceName}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          apt.status === 'completed' ? 'bg-[oklch(0.7_0.18_145)]/20 text-[oklch(0.7_0.18_145)]' :
                          apt.status === 'confirmed' ? 'bg-primary/20 text-primary' :
                          'bg-[oklch(0.8_0.15_85)]/20 text-[oklch(0.6_0.15_85)]'
                        }`}>
                          {apt.status === 'completed' ? 'Concluido' : 
                           apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="light bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Acoes Rapidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/dashboard/agenda?new=true">
                    <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 bg-primary/5 border-primary/20 hover:bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>Nova Marcacao</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/servicos">
                    <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 bg-[oklch(0.6_0.2_45)]/5 border-[oklch(0.6_0.2_45)]/20 hover:bg-[oklch(0.6_0.2_45)]/10">
                      <Scissors className="w-5 h-5 text-[oklch(0.6_0.2_45)]" />
                      <span>Editar Servicos</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/codigo">
                    <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 bg-primary/5 border-primary/20 hover:bg-primary/10">
                      <Key className="w-5 h-5 text-primary" />
                      <span>Codigo do Salao</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/financeiro">
                    <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4 bg-[oklch(0.7_0.18_145)]/5 border-[oklch(0.7_0.18_145)]/20 hover:bg-[oklch(0.7_0.18_145)]/10">
                      <DollarSign className="w-5 h-5 text-[oklch(0.7_0.18_145)]" />
                      <span>Financeiro</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Services Preview */}
            <Card className="light bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Servicos</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhum servico cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {services.slice(0, 4).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.duration} min</p>
                        </div>
                        <p className="font-bold text-primary">{formatCurrency(service.price)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
