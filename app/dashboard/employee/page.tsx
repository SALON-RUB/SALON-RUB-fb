'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Scissors, Calendar, DollarSign } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'

export default function EmployeeDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('user_session')
    if (!session) {
      router.push('/')
      return
    }

    try {
      const userData = JSON.parse(session)
      if (userData.role !== 'employee') {
        router.push('/')
        return
      }
      setUser(userData)
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user_session')
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AnimatedBackground variant="blue" />

      {/* Header */}
      <div className="relative z-10 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Scissors className="w-6 h-6 text-primary" />
              {user.salonName || 'Meu Salão'}
            </h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user.fullName}!</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Meus Agendamentos */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meus Agendamentos</CardTitle>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </CardContent>
            </Card>

            {/* Faturamento Pessoal */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento (Mês)</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Você não tem acesso ao faturamento geral</p>
              </CardContent>
            </Card>

            {/* Informações do Salão */}
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meu Salão</CardTitle>
                <Scissors className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">Código:</span> {user.salonCode}</p>
                  <p><span className="font-medium">Sala:</span> {user.salonName}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Avisos */}
          <Card className="mt-6 bg-blue-500/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-300">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✓ Você vê apenas seus agendamentos e faturamento pessoal</p>
              <p>✓ O faturamento geral do salão é visível apenas ao dono</p>
              <p>✓ Para alterações nos serviços ou horários, contate o dono</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
