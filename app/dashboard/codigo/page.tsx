'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Key,
  Copy,
  Share2,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Scissors,
  DollarSign,
  Users,
  Settings,
  LogOut,
  Check
} from 'lucide-react'
import Link from 'next/link'

export default function CodigoPage() {
  const { isAuthenticated, userRole, salon, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'owner') {
      router.push('/')
    }
  }, [isAuthenticated, userRole, router])

  if (!isAuthenticated || userRole !== 'owner' || !salon) {
    return null
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(salon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clientSiteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/cliente?code=${salon.code}`
    : ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(clientSiteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda' },
    { icon: Scissors, label: 'Servicos', href: '/dashboard/servicos' },
    { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
    { icon: Users, label: 'Equipe', href: '/dashboard/equipe' },
    { icon: Key, label: 'Codigo do Salao', href: '/dashboard/codigo', active: true },
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
              <h2 className="text-2xl font-bold">Codigo do Salao</h2>
              <p className="text-muted-foreground">Compartilhe o codigo para conectar a equipe e clientes</p>
            </div>

            {/* Main Code Card */}
            <Card className="light bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Key className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Codigo de Conexao</h3>
                    <p className="text-muted-foreground">Codigo unico do seu salao</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Codigo do Salao</p>
                  <p className="text-4xl font-bold tracking-[0.3em] font-mono">{salon.code}</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleCopyCode} className="flex-1">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copiar Codigo
                  </Button>
                  <Button variant="outline" onClick={handleCopyLink} className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Copiar Link do Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How to Use */}
            <Card className="light bg-card">
              <CardHeader>
                <CardTitle>Como usar o codigo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Equipe</h4>
                    <p className="text-muted-foreground text-sm">
                      Ao fazer login, o membro da equipe usa o email e senha cadastrados pelo dono.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Clientes</h4>
                    <p className="text-muted-foreground text-sm">
                      O cliente informa o codigo do salao ao fazer login, junto com nome e telefone, para visualizar os servicos e agendar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Site do Cliente</h4>
                    <p className="text-muted-foreground text-sm">
                      Compartilhe o link do site para que clientes agendem diretamente pelo navegador.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Site Link */}
            <Card className="light bg-card">
              <CardHeader>
                <CardTitle>Link do Site para Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Compartilhe este link com seus clientes para que eles possam agendar servicos diretamente.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-secondary/50 rounded-lg p-3 text-sm break-all">
                    {clientSiteUrl}
                  </div>
                  <Button variant="outline" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
