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

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não conferem')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    try {
      setLoading(true)
      console.log('[v0] Iniciando signup com:', { email, name })
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      })
      console.log('[v0] Resposta signup:', response)

      if (response.data?.user) {
        toast.success('Conta criada com sucesso!')
        setTimeout(() => {
          router.push('/sign-in')
        }, 1500)
      } else {
        toast.error('Erro ao criar conta')
        console.log('[v0] Erro: Sem dados de usuário')
      }
    } catch (error: any) {
      console.error('[v0] Erro ao criar conta:', error)
      if (error.message?.includes('already exists')) {
        toast.error('Este email já está registrado')
      } else {
        toast.error('Erro ao criar conta: ' + error.message)
      }
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
              <CardTitle>Criar Conta</CardTitle>
              <CardDescription>Crie sua conta Salon Rub</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
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
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
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
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Já tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/sign-in')}
                    className="text-primary hover:underline"
                  >
                    Fazer login
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
