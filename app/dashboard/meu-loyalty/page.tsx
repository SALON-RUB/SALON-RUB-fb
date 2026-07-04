'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedBackground } from '@/components/animated-background'
import { Coins, Target, Award, BarChart3 } from 'lucide-react'

export default function MeuLoyaltyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    myPoints: 0,
    pointsThisMonth: 0,
    nextReward: 0,
    totalEarned: 0,
  })

  useEffect(() => {
    const session = localStorage.getItem('salon_session')
    if (!session) {
      router.push('/sign-in')
      return
    }

    const sessionData = JSON.parse(session)
    setUser(sessionData)

    // Simular dados de loyalty do funcionário
    const myPoints = Math.floor(Math.random() * 5000) + 1000
    const pointsThisMonth = Math.floor(Math.random() * 1000) + 200
    
    setStats({
      myPoints,
      pointsThisMonth,
      nextReward: Math.max(100 - (myPoints % 100), 1),
      totalEarned: myPoints + Math.floor(Math.random() * 2000),
    })
  }, [router])

  if (!user) return null

  const progressPercentage = ((stats.myPoints % 100) / 100) * 100

  return (
    <DashboardLayout>
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
        <AnimatedBackground variant="teal" />
      </div>

      <div className="p-6 space-y-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold">Meus Pontos de Fidelização</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus ganhos e recompensas</p>
        </div>

        {/* Card Principal de Pontos */}
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur border-green-500/30">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Saldo de Pontos</p>
              <p className="text-6xl font-bold text-green-500 mb-2">{stats.myPoints}</p>
              <p className="text-muted-foreground">Pontos disponíveis para usar</p>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pontos (Este Mês)</p>
                  <p className="text-2xl font-bold text-primary">+{stats.pointsThisMonth}</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próxima Recompensa</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.nextReward} pontos</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Ganho</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.totalEarned}</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso até próxima recompensa */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Progresso para Próxima Recompensa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-3">
                <p className="text-sm font-medium">Progresso</p>
                <p className="text-sm font-bold text-green-500">{Math.floor(progressPercentage)}%</p>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ganhe {stats.nextReward} pontos para desbloquear um bônus especial!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Recompensas */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recompensas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Vale Café', points: 50, desc: 'Café grátis na próxima semana' },
                { name: 'Bônus Desempenho', points: 100, desc: '+R$ 10 no próximo pagamento' },
                { name: 'Dia de Folga Extra', points: 200, desc: 'Um dia de folga extra no mês' },
                { name: 'Prêmio Especial', points: 500, desc: 'Prêmio surpresa exclusivo' },
              ].map((reward, i) => (
                <div key={i} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{reward.name}</p>
                      <p className="text-xs text-muted-foreground">{reward.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{reward.points}pts</span>
                  </div>
                  <button className={`w-full text-sm py-1 px-2 rounded border transition-colors ${
                    stats.myPoints >= reward.points
                      ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground border-muted cursor-not-allowed'
                  }`}>
                    {stats.myPoints >= reward.points ? 'Usar' : 'Indisponível'}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Ganhos */}
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader>
            <CardTitle>Histórico Recente de Ganhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Coins className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Serviço {i + 1}</p>
                      <p className="text-xs text-muted-foreground">{new Date(Date.now() - i * 86400000).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-500">+{Math.floor(Math.random() * 50) + 10}p</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
