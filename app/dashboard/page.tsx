'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Loader } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession()
        if (!session.data?.user) {
          router.push('/sign-in')
          return
        }
        setUser(session.data.user)
      } catch (error) {
        router.push('/sign-in')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard Salon Rub</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {user?.name || 'Usuário'}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Email: {user?.email}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Funcionários</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Faturamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R$ 0,00</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
