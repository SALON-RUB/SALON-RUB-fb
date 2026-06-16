'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/toast'
import { User, ArrowLeft } from 'lucide-react'
import { getSalonByCode } from '@/app/actions/salon'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    salonCode: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email || !formData.salonCode) {
      setToastMessage('Preencha todos os campos')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (!formData.email.includes('@')) {
      setToastMessage('Email inválido')
      setToastType('error')
      setShowToast(true)
      return
    }

    try {
      // Verificar se o código do salão existe
      const salon = await getSalonByCode(formData.salonCode)
      if (!salon) {
        setToastMessage('Código do salão inválido')
        setToastType('error')
        setShowToast(true)
        return
      }

      const employeeId = `emp_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
      const session = {
        userId: employeeId,
        email: formData.email,
        fullName: formData.fullName,
        salonId: salon.id,
        salonCode: formData.salonCode,
        role: 'employee',
        loginTime: new Date().toISOString(),
      }
      
      localStorage.setItem('user_session', JSON.stringify(session))
      localStorage.setItem('salon_session', JSON.stringify(salon))
      
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

        <Card className="border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <CardTitle>Funcionário</CardTitle>
                <p className="text-sm text-muted-foreground">Acesso ao seu salão</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome Completo</label>
              <Input
                type="text"
                name="fullName"
                placeholder="João Silva"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="joao@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Código do Salão</label>
              <Input
                type="text"
                name="salonCode"
                placeholder="ABC123"
                value={formData.salonCode}
                onChange={handleChange}
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full mt-6 bg-primary hover:bg-primary/90"
            >
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
