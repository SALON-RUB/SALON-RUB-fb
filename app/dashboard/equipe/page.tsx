'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  getEmployeesBySalonId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeByEmail
} from '@/lib/store'
import type { Employee } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  Users,
  Plus,
  Pencil,
  Trash2,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Scissors,
  DollarSign,
  Key,
  Settings,
  LogOut,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Copy
} from 'lucide-react'
import Link from 'next/link'

export default function EquipePage() {
  const { isAuthenticated, userRole, salon, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    active: true
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
    setEmployees(getEmployeesBySalonId(salon.id))
  }

  if (!isAuthenticated || userRole !== 'owner' || !salon) {
    return null
  }

  const handleOpenModal = (employee?: Employee) => {
    setError('')
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        name: employee.name,
        email: employee.email,
        password: '',
        phone: employee.phone,
        active: employee.active
      })
    } else {
      setEditingEmployee(null)
      setFormData({ name: '', email: '', password: '', phone: '', active: true })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    setError('')
    
    if (!formData.name || !formData.email) {
      setError('Nome e e-mail sao obrigatorios')
      return
    }

    if (!editingEmployee && !formData.password) {
      setError('Senha e obrigatoria para novos membros')
      return
    }

    if (!editingEmployee && formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    const existingEmployee = getEmployeeByEmail(formData.email)
    if (existingEmployee && existingEmployee.id !== editingEmployee?.id) {
      setError('Este e-mail ja esta em uso')
      return
    }

    if (editingEmployee) {
      const updateData: Partial<Employee> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        active: formData.active
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      updateEmployee(editingEmployee.id, updateData)
    } else {
      createEmployee({
        salonId: salon.id,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      })
    }

    setShowModal(false)
    loadData()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      deleteEmployee(id)
      loadData()
    }
  }

  const handleToggleActive = (employee: Employee) => {
    updateEmployee(employee.id, { active: !employee.active })
    loadData()
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
    { icon: Scissors, label: 'Servicos', href: '/dashboard/servicos' },
    { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
    { icon: Users, label: 'Equipe', href: '/dashboard/equipe', active: true },
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
              <h2 className="text-2xl font-bold">Equipe</h2>
              <p className="text-muted-foreground">Gerencie a equipe do salao</p>
            </div>

            <Button onClick={() => handleOpenModal()} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Novo Membro
            </Button>

            {/* Salon Code Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Key className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary">Codigo do Salao</p>
                    <p className="text-sm text-muted-foreground">
                      Compartilhe este codigo com a equipe e clientes para que eles possam se conectar ao seu salao.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 bg-card rounded-lg p-3 font-mono text-lg font-bold tracking-wider">
                    {salon.code}
                  </div>
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(salon.code)}>
                    <Copy className="w-4 h-4 mr-2" /> Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team List */}
            <Card className="light bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Membros da Equipe</CardTitle>
                  </div>
                  <span className="text-muted-foreground">{employees.length} membros</span>
                </div>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum membro cadastrado. Clique em "Novo Membro" para adicionar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employees.map(emp => (
                      <div key={emp.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{emp.name}</p>
                            <p className="text-sm text-muted-foreground">{emp.email}</p>
                            {emp.phone && <p className="text-sm text-muted-foreground">{emp.phone}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={emp.active}
                            onCheckedChange={() => handleToggleActive(emp)}
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(emp)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(emp.id)}>
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

      {/* Employee Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Nome *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{editingEmployee ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 bg-input border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            {editingEmployee && (
              <div className="flex items-center justify-between">
                <Label>Membro Ativo</Label>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingEmployee ? 'Salvar' : 'Criar Membro'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
