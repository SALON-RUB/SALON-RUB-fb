'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Users, Scissors } from 'lucide-react'
import { createSalonIfNotExists, getSalonByCode } from '@/app/actions/salon'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [salon, setSalon] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('user_session')
    if (!session) {
      router.push('/')
      return
    }

    try {
      const userData = JSON.parse(session)
      if (userData.role !== 'owner') {
        router.push('/')
        return
      }
      
      setUser(userData)
      
      // Criar ou buscar salão
      const initSalon = async () => {
        try {
          const salonData = await createSalonIfNotExists(userData.userId, userData.fullName)
          if (salonData) {
            setSalon(salonData)
            // Atualizar sessão com salonId
            const updatedSession = { ...userData, salonId: salonData.id }
            localStorage.setItem('user_session', JSON.stringify(updatedSession))
            // Também salvar como salon_session para compatibilidade
            localStorage.setItem('salon_session', JSON.stringify(salonData))
          }
        } catch (error) {
          console.error('[v0] Erro ao criar salão:', error)
        } finally {
          setLoading(false)
        }
      }
      
      initSalon()
    } catch {
      router.push('/')
    }
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Carregando...</div>
      </DashboardLayout>
    )
  }

  if (!user || !salon) {
    return (
      <DashboardLayout>
        <div className="p-6">Erro ao carregar dados</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo, {user.fullName}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agendamentos Hoje */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Clientes agendados</p>
            </CardContent>
          </Card>

          {/* Faturamento Hoje */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground">Total de entradas</p>
            </CardContent>
          </Card>

          {/* Serviços Cadastrados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Serviços ativos</p>
            </CardContent>
          </Card>

          {/* Equipe */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipe</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-300">Seu Salão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Nome: <span className="font-medium">{salon.name}</span></p>
            <p>Código: <span className="font-medium">{salon.salonCode}</span></p>
            <p>Compartilhe este código com seus funcionários para que eles façam login.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
