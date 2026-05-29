'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { updateSalon, getSalonById } from '@/lib/store'
import type { BusinessHours } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Settings,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Scissors,
  DollarSign,
  Users,
  Key,
  LogOut,
  Building,
  Phone,
  MapPin,
  Clock,
  Save
} from 'lucide-react'
import Link from 'next/link'

const DAYS = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terca-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
] as const

export default function ConfiguracoesPage() {
  const { isAuthenticated, userRole, salon, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })
  
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null)

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'owner') {
      router.push('/')
      return
    }

    if (salon) {
      setFormData({
        name: salon.name,
        phone: salon.phone,
        address: salon.address,
      })
      setBusinessHours(salon.businessHours)
    }
  }, [isAuthenticated, userRole, salon, router])

  if (!isAuthenticated || userRole !== 'owner' || !salon || !businessHours) {
    return null
  }

  const handleSave = () => {
    updateSalon(salon.id, {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      businessHours,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleHoursChange = (day: keyof BusinessHours, field: 'open' | 'start' | 'end', value: boolean | string) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value,
      },
    })
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
    { icon: Scissors, label: 'Servicos', href: '/dashboard/servicos' },
    { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
    { icon: Users, label: 'Equipe', href: '/dashboard/equipe' },
    { icon: Key, label: 'Codigo do Salao', href: '/dashboard/codigo' },
    { icon: Settings, label: 'Configuracoes', href: '/dashboard/configuracoes', active: true },
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
              <h2 className="text-2xl font-bold">Configuracoes</h2>
              <p className="text-muted-foreground">Personalize as informacoes do seu salao</p>
            </div>

            {/* Salon Info */}
            <Card className="light bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <CardTitle>Informacoes do Salao</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Salao</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Endereco</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="light bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <CardTitle>Horario de Funcionamento</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {DAYS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                    <div className="w-28 flex-shrink-0">
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={businessHours[key].open}
                        onCheckedChange={(checked) => handleHoursChange(key, 'open', checked)}
                      />
                      <span className={`text-xs px-2 py-1 rounded ${businessHours[key].open ? 'bg-[oklch(0.7_0.18_145)]/20 text-[oklch(0.7_0.18_145)]' : 'bg-destructive/20 text-destructive'}`}>
                        {businessHours[key].open ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                    {businessHours[key].open && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Input
                          type="time"
                          value={businessHours[key].start}
                          onChange={(e) => handleHoursChange(key, 'start', e.target.value)}
                          className="w-[120px] bg-input border-border"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={businessHours[key].end}
                          onChange={(e) => handleHoursChange(key, 'end', e.target.value)}
                          className="w-[120px] bg-input border-border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Salvo!' : 'Salvar Alteracoes'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
