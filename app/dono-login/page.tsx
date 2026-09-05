'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/toast'
import { Scissors, ArrowLeft } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { ensureSalonProfile } from '@/app/actions/salon'

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
    setIsLoading(true)
    
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

    const result = await authClient.signUp.email({
      name: createData.fullName,
      email: createData.email,
      password: createData.password,
    })
    if (result.error || !result.data?.user) {
      setIsLoading(false)
      setToastMessage(result.error?.message || 'Não foi possível criar a conta')
      setToastType('error')
      setShowToast(true)
      return
    }

    const salon = await ensureSalonProfile(createData.nomeSalao, createData.numero)
    localStorage.setItem('user_session', JSON.stringify({
      userId: result.data.user.id,
      fullName: createData.fullName,
      nomeSalao: createData.nomeSalao,
      email: createData.email,
      salonCode: salon?.salonCode,
      role: 'owner',
    }))
    setIsLoading(false)
    setToastMessage('Conta criada com sucesso!')
    setToastType('success')
    setShowToast(true)
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (!loginData.email || !loginData.password) {
      setToastMessage('Preencha email e senha')
      setToastType('error')
      setShowToast(true)
      return
    }

    const result = await authClient.signIn.email({ email: loginData.email, password: loginData.password })
    if (result.error || !result.data?.user) {
      setIsLoading(false)
      setToastMessage('Email ou senha incorretos')
      setToastType('error')
      setShowToast(true)
      return
    }

    const salon = await ensureSalonProfile('Meu Salão')
    localStorage.setItem('user_session', JSON.stringify({
      userId: result.data.user.id,
      fullName: result.data.user.name,
      email: result.data.user.email,
      salonCode: salon?.salonCode,
      role: 'owner',
    }))
    setIsLoading(false)
    setToastMessage('Login realizado com sucesso!')
    setToastType('success')
    setShowToast(true)
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
      <Button type="button" variant="ghost" size="icon" className="absolute right-4 top-4 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400" aria-label="Abrir acesso administrativo" onClick={() => router.push('/admin')}><span aria-hidden="true" className="text-2xl leading-none">●</span></Button>
      {showToast && (
        <Toast message={toastMessage} type={toastType} isVisible={showToast} onClose={() => setShowToast(false)} />
      )}

      <div className="w-full max-w-md">
        {/* Modo Seleção */}
        {mode === 'choice' && (
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Scissors className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Salon Rub</CardTitle>
              <p className="text-center text-sm text-muted-foreground mt-2">Bem-vindo de volta!</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => setMode('create')} className="w-full" size="lg">
                Criar Conta
              </Button>
              <Button onClick={() => setMode('login')} variant="outline" className="w-full" size="lg">
                Fazer Login
              </Button>
              <Button onClick={() => router.push('/')} variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modo Criar */}
        {mode === 'create' && (
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Criar Conta</CardTitle>
              <p className="text-sm text-muted-foreground">Preencha seus dados</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Número</label>
                  <Input
                    name="numero"
                    value={createData.numero}
                    onChange={handleCreateChange}
                    placeholder="Seu número"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input
                    name="fullName"
                    value={createData.fullName}
                    onChange={handleCreateChange}
                    placeholder="Seu nome"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nome do Salão</label>
                  <Input
                    name="nomeSalao"
                    value={createData.nomeSalao}
                    onChange={handleCreateChange}
                    placeholder="Nome do seu salão"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={createData.email}
                    onChange={handleCreateChange}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Senha</label>
                  <Input
                    name="password"
                    type="password"
                    value={createData.password}
                    onChange={handleCreateChange}
                    placeholder="Sua senha"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Criar Conta
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => setMode('choice')}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modo Login */}
        {mode === 'login' && (
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Fazer Login</CardTitle>
              <p className="text-sm text-muted-foreground">Entre na sua conta</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Senha</label>
                  <Input
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Sua senha"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Fazer Login
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => setMode('choice')}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
