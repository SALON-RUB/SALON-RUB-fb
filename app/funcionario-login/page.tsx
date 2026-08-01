'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/toast'
import { User, ArrowLeft } from 'lucide-react'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
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

  const handleCreate = (e: React.FormEvent) => {
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

    // Verificar se salão existe
    const owners = JSON.parse(localStorage.getItem('owner_accounts') || '[]')
    const salonExists = owners.find((acc: any) => acc.salonCode === createData.salonCode.toUpperCase())

    if (!salonExists) {
      setToastMessage('Código do salão inválido')
      setToastType('error')
      setShowToast(true)
      return
    }

    // Salvar conta do funcionário
    const employees = JSON.parse(localStorage.getItem('employee_accounts') || '[]')
    
    if (employees.find((emp: any) => emp.email === createData.email)) {
      setToastMessage('Email já cadastrado')
      setToastType('error')
      setShowToast(true)
      return
    }

    const tempPassword = Math.random().toString(36).slice(2, 10)
    const newEmployee = {
      userId: `emp_${Date.now()}`,
      fullName: createData.fullName,
      email: createData.email,
      salonCode: createData.salonCode.toUpperCase(),
      password: tempPassword,
    }

    employees.push(newEmployee)
    localStorage.setItem('employee_accounts', JSON.stringify(employees))
    localStorage.setItem('user_session', JSON.stringify(newEmployee))

    setToastMessage(`Conta criada! Senha: ${tempPassword}`)
    setToastType('success')
    setShowToast(true)
    
    setTimeout(() => {
      router.push('/dashboard/employee')
    }, 1500)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginData.email || !loginData.password) {
      setToastMessage('Preencha email e senha')
      setToastType('error')
      setShowToast(true)
      return
    }

    // Buscar funcionário
    const employees = JSON.parse(localStorage.getItem('employee_accounts') || '[]')
    const employee = employees.find((emp: any) => emp.email === loginData.email && emp.password === loginData.password)

    if (!employee) {
      setToastMessage('Email ou senha incorretos')
      setToastType('error')
      setShowToast(true)
      return
    }

    localStorage.setItem('user_session', JSON.stringify(employee))

    setToastMessage('Login realizado com sucesso!')
    setToastType('success')
    setShowToast(true)
    
    setTimeout(() => {
      router.push('/dashboard/employee')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
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
                  <User className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Funcionário</CardTitle>
              <p className="text-center text-sm text-muted-foreground mt-2">Acesso do funcionário</p>
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
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input
                    name="fullName"
                    value={createData.fullName}
                    onChange={handleCreateChange}
                    placeholder="Seu nome"
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
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Código do Salão</label>
                  <Input
                    name="salonCode"
                    value={createData.salonCode}
                    onChange={handleCreateChange}
                    placeholder="Código do salão"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Criar Conta
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => setMode('choice')}
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
                  />
                </div>
                <Button type="submit" className="w-full">
                  Fazer Login
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => setMode('choice')}
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
