'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Scissors, Crown, User } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se há sessão ativa
    const session = localStorage.getItem('user_session')
    if (session) {
      try {
        const userData = JSON.parse(session)
        if (userData.role === 'owner') {
          router.push('/dashboard')
        } else if (userData.role === 'employee') {
          router.push('/dashboard/employee')
        }
      } catch {
        // Erro ao parsear, continuar na home
      }
    }
  }, [router])

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30">
              <Scissors className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Salon Rub</h1>
            <p className="text-muted-foreground">Sistema completo de gestão para salões de beleza e barbearias</p>
          </div>

          <div className="grid gap-3 pt-4">
            <Link href="/dono-login">
              <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/40 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">Dono do Salão</h3>
                      <p className="text-sm text-muted-foreground">Acesso completo à gestão</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/funcionario-login">
              <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/40 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">Funcionário</h3>
                      <p className="text-sm text-muted-foreground">Agenda e faturamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            Para clientes:{' '}
            <a href="/cliente" className="text-primary hover:underline">
              acesse aqui
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

