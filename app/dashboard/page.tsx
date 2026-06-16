'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Users, Scissors, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [salon, setSalon] = useState<any>(null)
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    faturamentoHoje: 0,
    servicosAtivos: 0,
    equipeMembros: 0,
    entradas: 0,
    despesas: 0,
  })

  useEffect(() => {
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

      const hoje = new Date().toISOString().split('T')[0]
      const agendamentosHoje = userData.salon?.appointments?.filter((a: any) =>
        a.data?.startsWith(hoje)
      ).length || 0

      const faturamentoHoje = userData.salon?.appointments?.filter((a: any) =>
        a.data?.startsWith(hoje) && a.status === 'concluído'
      ).reduce((sum: number, a: any) => sum + (a.preco || 0), 0) || 0

      const entradas = userData.salon?.entradas || 0
      const despesas = userData.salon?.despesas || 0

      setStats({
        agendamentosHoje,
        faturamentoHoje,
        servicosAtivos: userData.salon?.services?.length || 0,
        equipeMembros: userData.salon?.employees?.length || 0,
        entradas,
        despesas,
      })
    }
  }, [router])

  if (!user) return null

  const saldo = stats.entradas - stats.despesas

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {user.name} — {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Faturamento do Mês */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento do mês</p>
                <p className="text-3xl font-bold text-primary">R$ {stats.faturamentoHoje.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-primary/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financeiro Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {stats.entradas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total recebido</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {stats.despesas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total gasto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldo.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Saldo disponível</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.agendamentosHoje}</div>
              <p className="text-xs text-muted-foreground">
                {stats.agendamentosHoje === 0 ? 'Nenhum agendamento' : 'em andamento'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agenda de Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <Link href="/dashboard/agenda" className="text-primary hover:underline">Ver agenda →</Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
              <Scissors className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.servicosAtivos}</div>
              <p className="text-xs text-muted-foreground">0 total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipe</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.equipeMembros}</div>
              <p className="text-xs text-muted-foreground">Membros cadastrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div>
          <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/agenda">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Nova Marcação</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/servicos">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-gradient-to-br from-yellow-50 to-yellow-50/50 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-6 text-center">
                  <Scissors className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Editar Serviços</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/codigo">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6 text-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm mx-auto mb-2">
                    ∞
                  </div>
                  <p className="font-semibold text-sm">Código do Salão</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/financeiro">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardContent className="pt-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Financeiro</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
