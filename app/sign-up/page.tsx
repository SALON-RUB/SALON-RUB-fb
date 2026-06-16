'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/animated-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scissors } from 'lucide-react'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor preencha todos os campos')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não correspondem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (!email.includes('@')) {
      setError('Email inválido')
      return
    }

    setLoading(true)

    try {
      const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
      
      if (users.some((u: any) => u.email === email)) {
        setError('Este email já está registrado')
        setLoading(false)
        return
      }

      const userId = 'user_' + Date.now()
      const salonCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const newUser = {
        id: userId,
        name,
        email,
        password: btoa(password),
        salonCode,
        createdAt: new Date().toISOString(),
        salon: {
          name: '',
          phone: '',
          address: '',
          services: [],
          employees: [],
          appointments: [],
          expenses: [],
        }
      }

      users.push(newUser)
      localStorage.setItem('salon_users', JSON.stringify(users))
      localStorage.setItem('salon_session', JSON.stringify({
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        salonCode: newUser.salonCode,
      }))

      setSuccess('Conta criada com sucesso!')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('[v0] Erro:', error)
      setError('Erro ao criar conta')
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
            <span className="text-primary">Salon</span>{' '}
            <span className="text-foreground">Rub</span>
          </h1>
          <p className="text-center text-muted-foreground mb-8">Criar sua conta</p>

          {error && (
            <div className="bg-destructive/20 border border-destructive/50 text-destructive rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-600 rounded-lg p-3 mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link href="/sign-in" className="text-primary hover:underline font-medium">
                Faça login
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
