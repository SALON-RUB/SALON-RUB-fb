'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/animated-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scissors } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Por favor preencha todos os campos')
      return
    }

    setLoading(true)

    try {
      const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
      const user = users.find((u: any) => u.email === email && u.password === btoa(password))

      if (!user) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      localStorage.setItem('salon_session', JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        salonCode: user.salonCode,
      }))

      setError('')
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error) {
      console.error('[v0] Erro ao fazer login:', error)
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/95 backdrop-blur border border-border rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-primary rounded-xl p-4">
              <Scissors className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">
            <span className="text-primary">Salon</span> <span className="text-foreground">Rub</span>
          </h1>
          <p className="text-center text-muted-foreground mb-8">Fazer login</p>

          {error && (
            <div className="bg-destructive/20 border border-destructive/50 text-destructive rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Criar conta
              </Link>
            </p>
          </div>

          <Link href="/" className="block text-center mt-4 text-sm text-primary hover:underline">
            ← Voltar
          </Link>
        </div>
      </div>
    </main>
  )
}
