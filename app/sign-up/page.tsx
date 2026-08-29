'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { AnimatedBackground } from '@/components/animated-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scissors } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('As senhas não correspondem'); return }
    if (password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres'); return }
    setLoading(true)

    const result = await authClient.signUp.email({ name, email, password })
    if (result.error) {
      setError('Não foi possível criar a conta. Verifique os dados e tente novamente.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 flex justify-center"><div className="rounded-xl bg-primary p-4"><Scissors className="h-8 w-8 text-primary-foreground" /></div></div>
        <h1 className="text-center text-3xl font-bold"><span className="text-primary">Salon</span> Rub</h1>
        <p className="mb-8 text-center text-muted-foreground">Criar sua conta</p>
        {error && <div role="alert" className="mb-4 rounded-lg border border-destructive/50 bg-destructive/20 p-3 text-sm text-destructive">{error}</div>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div><label htmlFor="name" className="mb-2 block text-sm font-medium">Nome</label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} required disabled={loading} /></div>
          <div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} /></div>
          <div><label htmlFor="password" className="mb-2 block text-sm font-medium">Senha</label><Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} /></div>
          <div><label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">Confirmar senha</label><Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required disabled={loading} /></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Criando conta...' : 'Criar conta'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">Já tem conta? <Link href="/sign-in" className="font-medium text-primary hover:underline">Faça login</Link></p>
        <Link href="/" className="mt-4 block text-center text-sm text-primary hover:underline">Voltar</Link>
      </div>
    </main>
  )
}
