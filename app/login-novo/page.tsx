'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scissors } from 'lucide-react'
import { registerSalon, loginSalon } from '@/app/actions/login-simples'

export default function LoginNovo() {
  const routerRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    routerRef.current = router
  }, [router])

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')

  const [loginForm, setLoginForm] = useState({ email: '', senha: '' })
  const [registerForm, setRegisterForm] = useState({
    nome: '',
    nomeSalao: '',
    email: '',
    senha: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginForm.email || !loginForm.senha) {
      setMessage('Preencha todos os campos')
      setMessageType('error')
      return
    }

    setLoading(true)

    try {
      const result = await loginSalon(loginForm.email, loginForm.senha)

      if (result.success) {
        const session = {
          userId: result.userId,
          role: 'owner',
          fullName: result.nome,
          nomeSalao: result.nomeSalao,
          email: result.email,
          salonCode: result.salonCode,
        }

        localStorage.setItem('user_session', JSON.stringify(session))
        setMessage('Login realizado!')
        setMessageType('success')

        setTimeout(() => {
          if (routerRef.current) {
            routerRef.current.push('/dashboard')
          }
        }, 1000)
      } else {
        setMessage(result.error || 'Erro ao fazer login')
        setMessageType('error')
      }
    } catch (error: any) {
      setMessage(error.message || 'Erro ao fazer login')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !registerForm.nome ||
      !registerForm.nomeSalao ||
      !registerForm.email ||
      !registerForm.senha
    ) {
      setMessage('Preencha todos os campos')
      setMessageType('error')
      return
    }

    if (!registerForm.email.includes('@')) {
      setMessage('Email inválido')
      setMessageType('error')
      return
    }

    setLoading(true)

    try {
      const result = await registerSalon(registerForm)

      if (result.success) {
        const session = {
          userId: result.userId,
          role: 'owner',
          fullName: result.nome,
          nomeSalao: result.nomeSalao,
          email: result.email,
          salonCode: result.salonCode,
        }

        localStorage.setItem('user_session', JSON.stringify(session))
        setMessage('Conta criada com sucesso!')
        setMessageType('success')

        setTimeout(() => {
          if (routerRef.current) {
            routerRef.current.push('/dashboard')
          }
        }, 1000)
      } else {
        setMessage(result.error || 'Erro ao criar conta')
        setMessageType('error')
      }
    } catch (error: any) {
      setMessage(error.message || 'Erro ao criar conta')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Scissors className="w-8 h-8 text-purple-500" />
          </div>
          <CardTitle className="text-2xl">Salon Rub</CardTitle>
          <p className="text-gray-400 text-sm mt-2">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar uma nova conta'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <div
              className={`p-3 rounded text-sm ${
                messageType === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
              }`}
            >
              {message}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="mt-1 bg-[#2a2a2a] border-[#444]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Senha</label>
                <Input
                  type="password"
                  value={loginForm.senha}
                  onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                  placeholder="••••••••"
                  className="mt-1 bg-[#2a2a2a] border-[#444]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setMessage('')
                }}
                className="w-full text-purple-400 hover:text-purple-300 text-sm"
              >
                Não tem conta? Criar uma
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Seu Nome</label>
                <Input
                  value={registerForm.nome}
                  onChange={(e) => setRegisterForm({ ...registerForm, nome: e.target.value })}
                  placeholder="João Silva"
                  className="mt-1 bg-[#2a2a2a] border-[#444]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Nome do Salão</label>
                <Input
                  value={registerForm.nomeSalao}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, nomeSalao: e.target.value })
                  }
                  placeholder="Meu Salão"
                  className="mt-1 bg-[#2a2a2a] border-[#444]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Email</label>
                <Input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="mt-1 bg-[#2a2a2a] border-[#444]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Senha</label>
                <Input
                  type="password"
                  value={registerForm.senha}
                  onChange={(e) => setRegisterForm({ ...registerForm, senha: e.target.value })}
                  placeholder="••••••••"
                  className="mt-1 bg-[#2a2a2a] border-[#444]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Criando...' : 'Criar Conta'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setMessage('')
                }}
                className="w-full text-purple-400 hover:text-purple-300 text-sm"
              >
                Já tem conta? Entrar
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
