'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scissors, Crown, User, ArrowLeft, Eye, EyeOff, Mail, Lock, Phone, MapPin, Building } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'
import { toast } from 'sonner'

type Screen = 'home' | 'owner-login' | 'owner-register' | 'employee-login'

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('home')
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 z-10">
        {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
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
  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30">
          <Scissors className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Salon Rub</h1>
        <p className="text-muted-foreground">Sistema completo de gestão para salões de beleza e barbearias</p>
      </div>

      <div className="grid gap-3 pt-4">
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors bg-card/40 backdrop-blur-sm border-primary/20"
          onClick={() => onNavigate('owner-login')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Dono do Salão</h3>
                <p className="text-sm text-muted-foreground">Acesso completo à gestão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors bg-card/40 backdrop-blur-sm border-primary/20"
          onClick={() => onNavigate('employee-login')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Funcionário</h3>
                <p className="text-sm text-muted-foreground">Agenda e faturamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground">
        Para clientes:{' '}
        <a href="/cliente" className="text-primary hover:underline">
          acesse aqui
        </a>
      </div>
    </div>
  )
}

function OwnerLoginScreen({
  onBack,
  onRegister,
  onSuccess,
}: {
  onBack: () => void
  onRegister: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Login failed')
      onSuccess()
    } catch (error) {
      toast.error('Falha no login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <CardTitle>Login - Dono</CardTitle>
            <CardDescription>Acesso completo à gestão</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-input/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{' '}
          <button onClick={onRegister} className="text-primary hover:underline">
            Criar salão
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function OwnerRegisterScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [salonName, setSalonName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não conferem')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          salonName,
          phone,
          address,
        }),
      })

      if (!response.ok) throw new Error('Registration failed')
      onSuccess()
    } catch (error) {
      toast.error('Falha no cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <CardTitle>Criar Salão</CardTitle>
            <CardDescription>Cadastro do proprietário</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label>Seus Dados</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-input/50"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-input/50"
              required
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label>Dados do Salão</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salonName">Nome do Salão</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="salonName"
                placeholder="Ex: Salon Elite"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                className="pl-10 bg-input/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 bg-input/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="address"
                placeholder="Rua, número, cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10 bg-input/50"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Salão'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EmployeeLoginScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/employee-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
      })

      if (!response.ok) throw new Error('Login failed')
      onSuccess()
    } catch (error) {
      toast.error('Falha no login. Verifique seus dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <CardTitle>Login - Funcionário</CardTitle>
            <CardDescription>Agenda e faturamento</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código do Salão</Label>
            <Input
              id="code"
              placeholder="Ex: ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="bg-input/50 font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-input/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
