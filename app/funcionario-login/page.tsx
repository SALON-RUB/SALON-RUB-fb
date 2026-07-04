'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/toast'
import { User, ArrowLeft } from 'lucide-react'
import { createEmployeeAccount, loginEmployee } from '@/app/actions/auth'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'choice' | 'create' | 'login'>('choice')
  
  const [createData, setCreateData] = useState({
    fullName: '',
    email: '',
    salonCode: '',
  })

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCreateData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createData.fullName || !createData.email || !createData.salonCode) {
      setToastMessage('Preencha todos os campos')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (!createData.email.includes('@')) {
      setToastMessage('Email inválido')
      setToastType('error')
      setShowToast(true)
      return
    }

    setIsLoading(true)

    try {
      const result = await createEmployeeAccount(createData)
      
      if (!result.success) {
        setToastMessage(result.error || 'Erro ao criar conta')
        setToastType('error')
        setShowToast(true)
        setIsLoading(false)
        return
      }

      setToastMessage('Conta criada com sucesso!')
      setToastType('success')
      setShowToast(true)
      
      setTimeout(() => {
        router.push('/dashboard/employee')
      }, 1000)
    } catch (error) {
      console.error('[v0] Erro ao criar conta:', error)
      setToastMessage('Erro ao criar conta')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginData.email || !loginData.password) {
      setToastMessage('Preencha email e senha')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (!loginData.email.includes('@')) {
      setToastMessage('Email inválido')
      setToastType('error')
      setShowToast(true)
      return
    }

    setIsLoading(true)

    try {
      const result = await loginEmployee(loginData.email, loginData.password)
      
      if (!result.success) {
        setToastMessage(result.error || 'Email ou senha incorretos')
        setToastType('error')
        setShowToast(true)
        setIsLoading(false)
        return
      }

      setToastMessage('Login realizado com sucesso!')
      setToastType('success')
      setShowToast(true)
      
      setTimeout(() => {
        router.push('/dashboard/employee')
      }, 1000)
    } catch (error) {
      console.error('[v0] Erro ao fazer login:', error)
      setToastMessage('Erro ao fazer login')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {mode === 'choice' && (
          <Card className="border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle>Funcionário</CardTitle>
                  <p className="text-sm text-muted-foreground">Agenda e faturamento</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setMode('create')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Criar Nova Conta
              </Button>
              <Button
                onClick={() => setMode('login')}
                variant="outline"
                className="w-full"
              >
                Logar em Conta Existente
              </Button>
            </CardContent>
          </Card>
        )}

        {mode === 'create' && (
          <Card className="border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle>Criar Conta</CardTitle>
                  <p className="text-sm text-muted-foreground">Preencha seus dados</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome Completo</label>
                  <Input
                    type="text"
                    name="fullName"
                    placeholder="João Silva"
                    value={createData.fullName}
                    onChange={handleCreateChange}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="joao@email.com"
                    value={createData.email}
                    onChange={handleCreateChange}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Código do Salão</label>
                  <Input
                    type="text"
                    name="salonCode"
                    placeholder="ABC123"
                    value={createData.salonCode}
                    onChange={handleCreateChange}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando...' : 'Criar Conta'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode('choice')}
                  disabled={isLoading}
                >
                  Voltar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {mode === 'login' && (
          <Card className="border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle>Logar</CardTitle>
                  <p className="text-sm text-muted-foreground">Entre em sua conta</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="joao@email.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Senha</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Logar'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode('choice')}
                  disabled={isLoading}
                >
                  Voltar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
