'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/toast'
import { Scissors, ArrowLeft } from 'lucide-react'
import { createSalonIfNotExists, getSalonByCode } from '@/app/actions/salon'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'choice' | 'create' | 'login'>('choice')
  
  const [createData, setCreateData] = useState({
    numero: '',
    fullName: '',
    nomeSalao: '',
    email: '',
    password: '',
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
    
    if (!createData.numero || !createData.fullName || !createData.nomeSalao || !createData.email || !createData.password) {
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
      const ownerId = `owner_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
      // Criar salão com o nome fornecido
      const salon = await createSalonIfNotExists(ownerId, createData.nomeSalao)
      
      if (!salon) {
        setToastMessage('Erro ao criar salão')
        setToastType('error')
        setShowToast(true)
        setIsLoading(false)
        return
      }
      
      const session = {
        userId: ownerId,
        numero: createData.numero,
        email: createData.email,
        fullName: createData.fullName,
        nomeSalao: createData.nomeSalao,
        role: 'owner',
        salonId: salon.id,
        salonCode: salon.salonCode,
        loginTime: new Date().toISOString(),
      }
      
      localStorage.setItem('user_session', JSON.stringify(session))
      localStorage.setItem('salon_session', JSON.stringify(salon))
      
      setToastMessage('Conta criada com sucesso!')
      setToastType('success')
      setShowToast(true)
      
      setTimeout(() => {
        router.push('/dashboard')
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
      // Buscar conta existente no localStorage
      const allAccounts = localStorage.getItem('owner_accounts')
      const accounts = allAccounts ? JSON.parse(allAccounts) : []
      
      const account = accounts.find((acc: any) => acc.email === loginData.email && acc.password === loginData.password)
      
      if (!account) {
        setToastMessage('Email ou senha incorretos')
        setToastType('error')
        setShowToast(true)
        setIsLoading(false)
        return
      }

      // Recuperar dados da conta
      const session = {
        userId: account.userId,
        numero: account.numero,
        email: account.email,
        fullName: account.fullName,
        nomeSalao: account.nomeSalao,
        role: 'owner',
        salonId: account.salonId,
        salonCode: account.salonCode,
        loginTime: new Date().toISOString(),
      }
      
      localStorage.setItem('user_session', JSON.stringify(session))
      localStorage.setItem('salon_session', JSON.stringify({
        id: account.salonId,
        ownerId: account.userId,
        name: account.nomeSalao,
        salonCode: account.salonCode,
      }))
      
      setToastMessage('Login realizado com sucesso!')
      setToastType('success')
      setShowToast(true)
      
      setTimeout(() => {
        router.push('/dashboard')
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
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Scissors className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Dono do Salão</CardTitle>
                  <p className="text-sm text-muted-foreground">Acesso completo</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setMode('create')}
                className="w-full bg-primary hover:bg-primary/90"
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
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Scissors className="w-6 h-6 text-primary" />
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
                  <label className="text-sm font-medium mb-2 block">Número</label>
                  <Input
                    type="tel"
                    name="numero"
                    placeholder="(11) 98765-4321"
                    value={createData.numero}
                    onChange={handleCreateChange}
                    disabled={isLoading}
                  />
                </div>

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
                  <label className="text-sm font-medium mb-2 block">Nome do Salão</label>
                  <Input
                    type="text"
                    name="nomeSalao"
                    placeholder="Salon Rub"
                    value={createData.nomeSalao}
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
                  <label className="text-sm font-medium mb-2 block">Senha</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={createData.password}
                    onChange={handleCreateChange}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
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
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Scissors className="w-6 h-6 text-primary" />
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
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
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
