'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/toast'
import { Scissors, ArrowLeft } from 'lucide-react'
import { createSalonIfNotExists } from '@/app/actions/salon'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    numero: '',
    fullName: '',
    nomeSalao: '',
    email: '',
    password: '',
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
    
    if (!formData.numero || !formData.fullName || !formData.nomeSalao || !formData.email || !formData.password) {
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

    setIsLoading(true)

    try {
      const ownerId = `owner_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
      // Criar salão com o nome fornecido
      const salon = await createSalonIfNotExists(ownerId, formData.nomeSalao)
      
      if (!salon) {
        setToastMessage('Erro ao criar salão')
        setToastType('error')
        setShowToast(true)
        setIsLoading(false)
        return
      }
      
      const session = {
        userId: ownerId,
        numero: formData.numero,
        email: formData.email,
        fullName: formData.fullName,
        nomeSalao: formData.nomeSalao,
        role: 'owner',
        salonId: salon.id,
        salonCode: salon.salonCode,
        loginTime: new Date().toISOString(),
      }
      
      localStorage.setItem('user_session', JSON.stringify(session))
      localStorage.setItem('salon_session', JSON.stringify(salon))
      
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
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Número</label>
                <Input
                  type="tel"
                  name="numero"
                  placeholder="(11) 98765-4321"
                  value={formData.numero}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nome Completo</label>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="João Silva"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nome do Salão</label>
                <Input
                  type="text"
                  name="nomeSalao"
                  placeholder="Salon Rub"
                  value={formData.nomeSalao}
                  onChange={handleChange}
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Senha</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Carregando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

