'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/toast'
import { Scissors } from 'lucide-react'
import { addEmployee, getSalonByCode } from '@/app/actions/salon'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'mode' | 'login'>('mode')
  const [mode, setMode] = useState<'owner' | 'employee'>('owner')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    salonCode: '',
  })

  const handleOwnerLogin = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setToastMessage('Preencha todos os campos')
      setToastType('error')
      setShowToast(true)
      return
    }

    try {
      // Gerar ID único para o dono
      const ownerId = `owner_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
      // Salvar sessão do dono no localStorage
      const session = {
        userId: ownerId,
        email: formData.email,
        fullName: formData.fullName,
        role: 'owner',
        loginTime: new Date().toISOString(),
      }
      
      localStorage.setItem('user_session', JSON.stringify(session))
      
      setToastMessage('Login realizado com sucesso!')
      setToastType('success')
      setShowToast(true)
      
      // Redirecionar para dashboard do dono
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      setToastMessage('Erro ao fazer login')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleEmployeeRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.salonCode) {
      setToastMessage('Preencha todos os campos')
      setToastType('error')
      setShowToast(true)
      return
    }

    try {
      // Buscar salão pelo código
      const salon = await getSalonByCode(formData.salonCode)
      
      if (!salon) {
        setToastMessage('Código do salão não encontrado')
        setToastType('error')
        setShowToast(true)
        return
      }

      // Gerar ID único para o funcionário
      const employeeId = `emp_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
      // Adicionar funcionário ao banco de dados
      const newEmployee = await addEmployee(salon.id, {
        name: formData.fullName,
        email: formData.email,
        userId: employeeId,
      })

      // Salvar sessão do funcionário
      const session = {
        userId: employeeId,
        email: formData.email,
        fullName: formData.fullName,
        role: 'employee',
        salonId: salon.id,
        salonCode: salon.salonCode,
        salonName: salon.name,
        loginTime: new Date().toISOString(),
      }
      
      localStorage.setItem('user_session', JSON.stringify(session))
      
      setToastMessage('Cadastro realizado com sucesso!')
      setToastType('success')
      setShowToast(true)
      
      // Redirecionar para dashboard do funcionário
      setTimeout(() => {
        router.push('/dashboard/employee')
      }, 1000)
    } catch (error: any) {
      console.error('[v0] Erro:', error)
      setToastMessage(error.message || 'Erro ao cadastrar funcionário')
      setToastType('error')
      setShowToast(true)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30">
            <Scissors className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Salon Rub</h1>
          <p className="text-muted-foreground">Sistema de Gerenciamento</p>
        </div>

        {/* Mode Selection */}
        {step === 'mode' && (
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Selecione seu acesso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => {
                  setMode('owner')
                  setStep('login')
                }}
                className="w-full h-12"
                variant={mode === 'owner' ? 'default' : 'outline'}
              >
                Sou Dono/Gerente
              </Button>
              <Button
                onClick={() => {
                  setMode('employee')
                  setStep('login')
                }}
                className="w-full h-12"
                variant={mode === 'employee' ? 'default' : 'outline'}
              >
                Sou Funcionário
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        {step === 'login' && (
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>
                {mode === 'owner' ? 'Login do Dono' : 'Cadastro de Funcionário'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome Completo</label>
                <Input
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  placeholder="Digite uma senha"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {mode === 'employee' && (
                <div>
                  <label className="text-sm font-medium">Código do Salão</label>
                  <Input
                    placeholder="Ex: VHORJ7"
                    value={formData.salonCode}
                    onChange={(e) =>
                      setFormData({ ...formData, salonCode: e.target.value.toUpperCase() })
                    }
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('mode')
                    setFormData({ fullName: '', email: '', password: '', salonCode: '' })
                  }}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={
                    mode === 'owner' ? handleOwnerLogin : handleEmployeeRegister
                  }
                  className="flex-1"
                >
                  {mode === 'owner' ? 'Entrar' : 'Cadastrar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
