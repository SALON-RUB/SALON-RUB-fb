'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Scissors, Calendar, Users } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [salon, setSalon] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const session = localStorage.getItem('salon_session')
        if (!session) {
          router.push('/sign-in')
          return
        }

        const sessionData = JSON.parse(session)
        setUser(sessionData)

        const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
        const userData = users.find((u: any) => u.id === sessionData.userId)
        if (userData) {
          setSalon(userData.salon || {})
        }
      } catch (error) {
        console.error('[v0] Erro ao verificar autenticação:', error)
        router.push('/sign-in')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('salon_session')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Scissors className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <Scissors className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-primary">Salon</span> <span className="text-foreground">Rub</span>
              </h1>
              <p className="text-sm text-muted-foreground">Código: {user.salonCode}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Bem-vindo, {user.name}!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Você está logado como proprietário do salão. Compartilhe o código {user.salonCode} com seus funcionários para que eles possam se conectar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salon?.appointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Agendamentos do mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salon?.employees?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Equipe ativa</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações do Salão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Código do Salão</p>
                <p className="font-medium font-mono">{user.salonCode}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
