'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Home,
  Calendar,
  Scissors,
  DollarSign,
  Users,
  Key,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const session = localStorage.getItem('salon_session')
    if (!session) {
      router.push('/sign-in')
      return
    }
    setUser(JSON.parse(session))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('salon_session')
    router.push('/')
  }

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
    { label: 'Serviços', href: '/dashboard/servicos', icon: Scissors },
    { label: 'Financeiro', href: '/dashboard/financeiro', icon: DollarSign },
    { label: 'Equipe', href: '/dashboard/equipe', icon: Users },
    { label: 'Código do Salão', href: '/dashboard/codigo', icon: Key },
    { label: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  ]

  if (!user) {
    return <div></div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Mobile */}
      <header className="md:hidden border-b border-border bg-card sticky top-0 z-20">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">
            <span className="text-primary">Salon</span> <span className="text-foreground">Rub</span>
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="border-t border-border">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 transition-colors ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary font-medium'
                      : 'border-transparent hover:bg-accent'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border-l-4 border-transparent"
            >
              <LogOut size={20} />
              Sair
            </button>
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex md:w-64 bg-card border-r border-border flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold">
              <span className="text-primary">Salon</span> <span className="text-foreground">Rub</span>
            </h1>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 m-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors w-[calc(100%-2rem)]"
          >
            <LogOut size={20} />
            Sair
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
