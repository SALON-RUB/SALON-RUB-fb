'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Plus, X, TrendingUp, TrendingDown } from 'lucide-react'

export default function FinanceiroPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [periodo, setPeriodo] = useState('mes')
  const [formType, setFormType] = useState<'entrada' | 'despesa' | null>(null)
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '0',
    data: new Date().toISOString().split('T')[0],
  })

  const [financeiro, setFinanceiro] = useState({
    entradas: 0,
    despesas: 0,
    movimentacoes: [] as any[],
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
    if (userData?.salon) {
      setFinanceiro({
        entradas: userData.salon.entradas || 0,
        despesas: userData.salon.despesas || 0,
        movimentacoes: userData.salon.movimentacoes || [],
      })
    }
  }, [router])

  const handleAddMovimento = () => {
    if (!formData.descricao || !formData.valor || parseFloat(formData.valor) === 0) {
      alert('Preencha descritção e valor')
      return
    }

    const valor = parseFloat(formData.valor)
    const novaMovimentacao = {
      id: 'mov_' + Date.now(),
      tipo: formType,
      descricao: formData.descricao,
      valor,
      data: formData.data,
      criado_em: new Date().toISOString(),
    }

    const novasMovimentacoes = [...financeiro.movimentacoes, novaMovimentacao]
    const novasEntradas = formType === 'entrada' ? financeiro.entradas + valor : financeiro.entradas
    const novasDespesas = formType === 'despesa' ? financeiro.despesas + valor : financeiro.despesas

    setFinanceiro({
      entradas: novasEntradas,
      despesas: novasDespesas,
      movimentacoes: novasMovimentacoes,
    })

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex].salon.entradas = novasEntradas
      users[userIndex].salon.despesas = novasDespesas
      users[userIndex].salon.movimentacoes = novasMovimentacoes
      localStorage.setItem('salon_users', JSON.stringify(users))
    }

    setFormData({ descricao: '', valor: '0', data: new Date().toISOString().split('T')[0] })
    setFormType(null)
  }

  const handleDeleteMovimento = (id: string) => {
    const mov = financeiro.movimentacoes.find((m) => m.id === id)
    if (!mov) return

    let novasEntradas = financeiro.entradas
    let novasDespesas = financeiro.despesas

    if (mov.tipo === 'entrada') {
      novasEntradas -= mov.valor
    } else {
      novasDespesas -= mov.valor
    }

    const novasMovimentacoes = financeiro.movimentacoes.filter((m) => m.id !== id)

    setFinanceiro({
      entradas: novasEntradas,
      despesas: novasDespesas,
      movimentacoes: novasMovimentacoes,
    })

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex].salon.entradas = novasEntradas
      users[userIndex].salon.despesas = novasDespesas
      users[userIndex].salon.movimentacoes = novasMovimentacoes
      localStorage.setItem('salon_users', JSON.stringify(users))
    }
  }

  const saldo = financeiro.entradas - financeiro.despesas
  const movimentacoesMes = financeiro.movimentacoes.filter((m) => {
    const mesAtual = new Date().toISOString().substring(0, 7)
    return m.data.substring(0, 7) === mesAtual
  })

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financeiro</h1>
            <p className="text-muted-foreground mt-1">Acompanhe o faturamento e despesas</p>
          </div>
        </div>

        {/* Filtro */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriodo('mes')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodo === 'mes'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setPeriodo('ano')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodo === 'ano'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Este Ano
          </button>
        </div>

        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 dark:from-success/20 dark:to-success/10 border-success/30 dark:border-success/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">R$ {financeiro.entradas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total recebido</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {financeiro.despesas.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total gasto</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {saldo.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Saldo disponível</p>
            </CardContent>
          </Card>
        </div>

        {/* Faturamento por Membro */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Membro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Nenhum membro cadastrado</p>
          </CardContent>
        </Card>

        {/* Movimentações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Movimentações</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setFormType(formType === 'entrada' ? null : 'entrada')}
                className="gap-1"
                variant={formType === 'entrada' ? 'default' : 'outline'}
              >
                <Plus size={16} />
                Entrada
              </Button>
              <Button
                size="sm"
                onClick={() => setFormType(formType === 'despesa' ? null : 'despesa')}
                className="gap-1"
                variant={formType === 'despesa' ? 'default' : 'outline'}
              >
                <Plus size={16} />
                Despesa
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formType && (
              <Card className="bg-accent/50">
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Input
                      placeholder="Descreva a movimentação"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Data</label>
                      <Input
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddMovimento} className="flex-1">
                      Confirmar
                    </Button>
                    <Button
                      onClick={() => setFormType(null)}
                      variant="outline"
                      className="px-4"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {movimentacoesMes.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Nenhuma movimentação para este período</p>
              </div>
            ) : (
              <div className="space-y-2">
                {movimentacoesMes.map((mov) => (
                  <Card key={mov.id} className="bg-accent/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`p-2 rounded-lg ${
                              mov.tipo === 'entrada'
                                ? 'bg-green-100 dark:bg-green-900'
                                : 'bg-red-100 dark:bg-red-900'
                            }`}
                          >
                            {mov.tipo === 'entrada' ? (
                              <TrendingUp
                                size={16}
                                className="text-success"
                              />
                            ) : (
                              <TrendingDown
                                size={16}
                                className="text-destructive"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{mov.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(mov.data).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <p
                            className={`font-bold ${
                              mov.tipo === 'entrada'
                                ? 'text-success'
                                : 'text-destructive'
                            }`}
                          >
                            {mov.tipo === 'entrada' ? '+' : '-'} R$ {mov.valor.toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleDeleteMovimento(mov.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
