'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/toast'
import { Scissors, ArrowLeft } from 'lucide-react'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  const handleLogin = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setToastMessage('Preencha todos os campos')
      setToastType('error')
      setShowToast(true)
      return
    }

    try {
      const ownerId = `owner_${Date.now()}_${Math.random().toString(36).slice(2)}`
      
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
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
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
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome Completo</label>
              <Input
                placeholder="João Silva"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="joao@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
