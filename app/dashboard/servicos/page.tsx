'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  getServicesBySalonId,
  createService,
  updateService,
  deleteService,
  formatCurrency
} from '@/lib/store'
import type { Service } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  Scissors,
  Plus,
  Pencil,
  Trash2,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  DollarSign,
  Users,
  Key,
  Settings,
  LogOut,
  Clock
} from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['Cabelo', 'Barba', 'Sobrancelha', 'Unha', 'Maquiagem', 'Tratamento', 'Outro']

export default function ServicosPage() {
  const { isAuthenticated, userRole, salon, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [services, setServices] = useState<Service[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: 30,
    price: 0,
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
    setServices(getServicesBySalonId(salon.id))
  }

  if (!isAuthenticated || userRole !== 'owner' || !salon) {
    return null
  }

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        category: service.category,
        duration: service.duration,
        price: service.price,
        active: service.active
      })
    } else {
      setEditingService(null)
      setFormData({ name: '', category: '', duration: 30, price: 0, active: true })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.category) return

    if (editingService) {
      updateService(editingService.id, formData)
    } else {
      createService({
        salonId: salon.id,
        ...formData
      })
    }

    setShowModal(false)
    loadData()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este servico?')) {
      deleteService(id)
      loadData()
    }
  }

  const handleToggleActive = (service: Service) => {
    updateService(service.id, { active: !service.active })
    loadData()
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
    { icon: Scissors, label: 'Servicos', href: '/dashboard/servicos', active: true },
    { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
    { icon: Users, label: 'Equipe', href: '/dashboard/equipe' },
    { icon: Key, label: 'Codigo do Salao', href: '/dashboard/codigo' },
    { icon: Settings, label: 'Configuracoes', href: '/dashboard/configuracoes' },
  ]

  const groupedServices = CATEGORIES.map(cat => ({
    category: cat,
    services: services.filter(s => s.category === cat)
  })).filter(g => g.services.length > 0)

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
              <h2 className="text-2xl font-bold">Servicos</h2>
              <p className="text-muted-foreground">Gerencie os servicos e precos do salao</p>
            </div>

            <Button onClick={() => handleOpenModal()} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Novo Servico
            </Button>

            {/* Services Table Header */}
            <Card className="light bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">SERVICO</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">CATEGORIA</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">DURACAO</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">PRECO</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">STATUS</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">ACOES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">Nenhum servico cadastrado. Clique em "Novo Servico" para adicionar.</p>
                        </td>
                      </tr>
                    ) : (
                      services.map(service => (
                        <tr key={service.id} className="border-t border-border">
                          <td className="p-4">
                            <p className="font-medium">{service.name}</p>
                          </td>
                          <td className="p-4 text-muted-foreground">{service.category}</td>
                          <td className="p-4 text-muted-foreground">{service.duration} min</td>
                          <td className="p-4 font-medium text-primary">{formatCurrency(service.price)}</td>
                          <td className="p-4">
                            <Switch
                              checked={service.active}
                              onCheckedChange={() => handleToggleActive(service)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleOpenModal(service)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(service.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Service Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Editar Servico' : 'Novo Servico'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Servico *</Label>
              <Input
                placeholder="Ex: Corte Masculino"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duracao (minutos) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="5"
                  step="5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preco (R$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Servico Ativo</Label>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingService ? 'Salvar' : 'Criar Servico'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
