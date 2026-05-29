'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scissors, Crown, User, Users, ArrowLeft, Eye, EyeOff, Mail, Lock, Phone, MapPin, Building } from 'lucide-react'
import { createSalon, getSalonByOwnerEmail } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'

type Screen = 'home' | 'owner-login' | 'owner-register' | 'employee-login'

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('home')
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        {screen === 'home' && (
          <HomeScreen onNavigate={setScreen} />
        )}
        {screen === 'owner-login' && (
          <OwnerLoginScreen 
            onBack={() => setScreen('home')} 
            onRegister={() => setScreen('owner-register')}
            onSuccess={() => router.push('/dashboard')}
          />
        )}
        {screen === 'owner-register' && (
          <OwnerRegisterScreen 
            onBack={() => setScreen('owner-login')} 
            onSuccess={() => router.push('/dashboard')}
          />
        )}
        {screen === 'employee-login' && (
          <EmployeeLoginScreen 
            onBack={() => setScreen('home')}
            onSuccess={() => router.push('/funcionario')}
          />
        )}
      </div>
    </main>
  )
}

function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const router = useRouter()
  
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center">
          <Scissors className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">
          <span className="text-primary">Salao</span> <span className="text-foreground">Pro</span>
        </h1>
        <p className="text-muted-foreground">
          Sistema completo de gestao para saloes de beleza e barbearias
        </p>
      </div>

      <div className="space-y-4">
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur border-border"
          onClick={() => onNavigate('owner-login')}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Dono do Salao</h3>
                <p className="text-sm text-muted-foreground">Acesso completo a gestao</p>
                <span className="text-primary text-sm font-medium inline-flex items-center gap-1 mt-2">
                  Entrar <ArrowLeft className="w-4 h-4 rotate-180" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur border-border"
          onClick={() => onNavigate('employee-login')}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Funcionario</h3>
                <p className="text-sm text-muted-foreground">Agenda e faturamento</p>
                <span className="text-primary text-sm font-medium inline-flex items-center gap-1 mt-2">
                  Entrar <ArrowLeft className="w-4 h-4 rotate-180" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur border-border"
          onClick={() => router.push('/cliente')}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Cliente</h3>
                <p className="text-sm text-muted-foreground">Agende seu horario</p>
                <span className="text-primary text-sm font-medium inline-flex items-center gap-1 mt-2">
                  Entrar <ArrowLeft className="w-4 h-4 rotate-180" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OwnerLoginScreen({ 
  onBack, 
  onRegister, 
  onSuccess 
}: { 
  onBack: () => void
  onRegister: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password, 'owner')
    setLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Erro ao fazer login')
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center">
          <Scissors className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">
          <span className="text-primary">Salao</span> <span className="text-foreground">Pro</span>
        </h1>
        <p className="text-muted-foreground">Gestao completa para seu salao</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle>Acesso do Dono</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label>E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-input border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Nao tem uma conta?{' '}
              <button 
                type="button"
                onClick={onRegister}
                className="text-primary hover:underline"
              >
                Criar salao
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function OwnerRegisterScreen({ 
  onBack,
  onSuccess 
}: { 
  onBack: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    salonName: '',
    phone: '',
    address: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    const existingSalon = getSalonByOwnerEmail(formData.email)
    if (existingSalon) {
      setError('Este e-mail ja esta cadastrado')
      return
    }

    setLoading(true)

    try {
      createSalon({
        name: formData.salonName,
        phone: formData.phone,
        address: formData.address,
        ownerName: formData.ownerName,
        ownerEmail: formData.email,
        ownerPassword: formData.password,
      })

      await login(formData.email, formData.password, 'owner')
      onSuccess()
    } catch {
      setError('Erro ao criar salao')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 max-h-screen overflow-y-auto py-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle>Cadastro do Dono</CardTitle>
          <CardDescription>Crie sua conta e seu salao</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Seu Nome *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome completo"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 bg-input border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirmar Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-primary font-medium mb-4">Dados do Salao</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Salao *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Ex: Salao Elite"
                      value={formData.salonName}
                      onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                      className="pl-10 bg-input border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Telefone do Salao</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Endereco</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rua, numero, cidade"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Salao'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function EmployeeLoginScreen({ 
  onBack,
  onSuccess 
}: { 
  onBack: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password, 'employee')
    setLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Erro ao fazer login')
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center">
          <Scissors className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">
          <span className="text-primary">Salao</span> <span className="text-foreground">Pro</span>
        </h1>
        <p className="text-muted-foreground">Acesso da equipe</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle>Login da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label>E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-input border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              O cadastro de funcionarios e feito pelo dono do salao
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
