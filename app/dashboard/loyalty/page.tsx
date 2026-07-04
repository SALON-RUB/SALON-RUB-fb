'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedBackground } from '@/components/animated-background'
import { Gift, TrendingUp, Users, Zap } from 'lucide-react'

export default function LoyaltyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalPoints: 0,
    pointsThisMonth: 0,
    activeClients: 0,
    employeesCount: 0,
  })

  useEffect(() => {
    const session = localStorage.getItem('salon_session')
    if (!session) {
      router.push('/sign-in')
      return
    }

    const sessionData = JSON.parse(session)
    setUser(sessionData)

    // Simular dados de loyalty (em produção viriam do banco de dados)
    const ownerAccounts = JSON.parse(localStorage.getItem('owner_accounts') || '[]')
    const owner = ownerAccounts.find((acc: any) => acc.salonId === sessionData.id)
    
    if (owner) {
      const salon_users = JSON.parse(localStorage.getItem('salon_users') || '[]')
      const employees = salon_users.filter((u: any) => u.role === 'employee' && u.salonId === sessionData.id)
      const appointments = owner.salon?.appointments || []
      
      setStats({
        totalPoints: Math.floor(Math.random() * 10000) + 5000,
        pointsThisMonth: Math.floor(Math.random() * 2000) + 500,
        activeClients: appointments.length > 0 ? Math.ceil(appointments.length * 0.7) : 0,
        employeesCount: employees.length,
      })
    }
  }, [router])

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
        <AnimatedBackground variant="purple" />
      </div>

      <div className="p-6 space-y-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold">Programa de Pontos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe o programa de fidelização do seu salão</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Pontos</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalPoints.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pontos (Este Mês)</p>
                  <p className="text-3xl font-bold text-orange-500">{stats.pointsThisMonth.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                  <p className="text-3xl font-bold text-green-500">{stats.activeClients}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Funcionários</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.employeesCount}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Programa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-primary">1</div>
                  <div>
                    <p className="font-medium">Cliente realiza agendamento</p>
                    <p className="text-sm text-muted-foreground">Cliente cria conta e agenda um serviço</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-primary">2</div>
                  <div>
                    <p className="font-medium">Ganha pontos automaticamente</p>
                    <p className="text-sm text-muted-foreground">1 ponto para cada R$ 1,00 gasto</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div>
                    <p className="font-medium">Usa pontos em descontos</p>
                    <p className="text-sm text-muted-foreground">100 pontos = R$ 10,00 em desconto</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Distribuição de Pontos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium">Clientes</p>
                    <p className="text-sm font-bold text-primary">60%</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium">Funcionários</p>
                    <p className="text-sm font-bold text-orange-500">30%</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium">Reserva Salão</p>
                    <p className="text-sm font-bold text-green-500">10%</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico Recente */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Cliente {i + 1}</p>
                      <p className="text-xs text-muted-foreground">Agendamento realizado</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary">+{Math.floor(Math.random() * 100) + 50}p</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
