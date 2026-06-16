'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, ArrowLeft, Loader } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'
import { toast } from 'sonner'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      setLoading(true)
      const response = await authClient.signIn.email({
        email,
        password,
      })

      if (response.data?.user) {
        toast.success('Bem-vindo!')
        router.push('/dashboard')
      } else {
        toast.error('Email ou senha incorretos')
      }
    } catch (error) {
      toast.error('Erro ao fazer login')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Card className="bg-card/40 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Acesse sua conta Salon Rub</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
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
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/sign-up')}
                    className="text-primary hover:underline"
                  >
                    Criar conta
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
