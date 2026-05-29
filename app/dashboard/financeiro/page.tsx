'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  getTransactionsBySalonId,
  getEmployeesBySalonId,
  createTransaction,
  deleteTransaction,
  formatCurrency
} from '@/lib/store'
import type { Transaction, Employee } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Key,
  Settings,
  LogOut,
  Filter
} from 'lucide-react'
import Link from 'next/link'

export default function FinanceiroPage() {
  const { isAuthenticated, userRole, salon, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showModal, setShowModal] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState<string>('month')
  
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    employeeId: ''
  })

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'owner') {
      router.push('/')
      return
    }

    if (salon) {
      loadData()
    }
  }, [isAuthenticated, userRole, salon, router])

  const loadData = () => {
    if (!salon) return
    setTransactions(getTransactionsBySalonId(salon.id))
    setEmployees(getEmployeesBySalonId(salon.id))
  }

  if (!isAuthenticated || userRole !== 'owner' || !salon) {
    return null
  }

  const now = new Date()
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    if (filterPeriod === 'today') {
      return t.date === now.toISOString().split('T')[0]
    } else if (filterPeriod === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return date >= weekAgo
    } else if (filterPeriod === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    } else if (filterPeriod === 'year') {
      return date.getFullYear() === now.getFullYear()
    }
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  const employeeEarnings = employees.map(emp => {
    const empTransactions = filteredTransactions.filter(t => t.employeeId === emp.id && t.type === 'income')
    return {
      employee: emp,
      total: empTransactions.reduce((sum, t) => sum + t.amount, 0)
    }
  }).filter(e => e.total > 0).sort((a, b) => b.total - a.total)

  const handleSave = () => {
    if (!formData.category || !formData.amount) return

    const employee = employees.find(e => e.id === formData.employeeId)

    createTransaction({
      salonId: salon.id,
      type: formData.type,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
      date: formData.date,
      employeeId: employee?.id || null,
      employeeName: employee?.name || null
    })

    setShowModal(false)
    setFormData({ type: 'income', category: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0], employeeId: '' })
    loadData()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transacao?')) {
      deleteTransaction(id)
      loadData()
    }
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
    { icon: Scissors, label: 'Servicos', href: '/dashboard/servicos' },
    { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro', active: true },
    { icon: Users, label: 'Equipe', href: '/dashboard/equipe' },
    { icon: Key, label: 'Codigo do Salao', href: '/dashboard/codigo' },
    { icon: Settings, label: 'Configuracoes', href: '/dashboard/configuracoes' },
  ]

  return (
    <div className="min-h-screen bg-background">
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
            <div>
              <h2 className="text-2xl font-bold">Financeiro</h2>
              <p className="text-muted-foreground">Acompanhe o faturamento e despesas</p>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-[180px] bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="grid gap-4">
              <Card className="light bg-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Entradas</p>
                    <p className="text-2xl font-bold text-[oklch(0.7_0.18_145)]">{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="w-12 h-12 bg-[oklch(0.7_0.18_145)]/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[oklch(0.7_0.18_145)]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="light bg-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas</p>
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
                  </div>
                  <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  </div>
                </CardContent>
              </Card>

              <Card className="light bg-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[oklch(0.7_0.18_145)]' : 'text-destructive'}`}>{formatCurrency(balance)}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Earnings */}
            {employeeEarnings.length > 0 && (
              <Card className="light bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Faturamento por Membro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {employeeEarnings.map(({ employee, total }) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <span className="font-medium">{employee.name}</span>
                      <span className="font-bold text-[oklch(0.7_0.18_145)]">{formatCurrency(total)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {employeeEarnings.length === 0 && (
              <Card className="light bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Faturamento por Membro</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-4">Nenhum membro cadastrado</p>
                </CardContent>
              </Card>
            )}

            {/* Transactions */}
            <Card className="light bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Movimentacoes</CardTitle>
                </div>
                <Button size="sm" onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma movimentacao no periodo selecionado</p>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-[oklch(0.7_0.18_145)]/20' : 'bg-destructive/20'}`}>
                            {t.type === 'income' ? <TrendingUp className="w-5 h-5 text-[oklch(0.7_0.18_145)]" /> : <TrendingDown className="w-5 h-5 text-destructive" />}
                          </div>
                          <div>
                            <p className="font-medium">{t.description || t.category}</p>
                            <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString('pt-BR')} {t.employeeName && `• ${t.employeeName}`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${t.type === 'income' ? 'text-[oklch(0.7_0.18_145)]' : 'text-destructive'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Transaction Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nova Movimentacao</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(v: 'income' | 'expense') => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === 'income' ? (
                    <>
                      <SelectItem value="Servico">Servico</SelectItem>
                      <SelectItem value="Produto">Venda de Produto</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Salario">Salario</SelectItem>
                      <SelectItem value="Produtos">Produtos</SelectItem>
                      <SelectItem value="Manutencao">Manutencao</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Input
                placeholder="Descricao da movimentacao"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            {formData.type === 'income' && (
              <div className="space-y-2">
                <Label>Membro (opcional)</Label>
                <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
