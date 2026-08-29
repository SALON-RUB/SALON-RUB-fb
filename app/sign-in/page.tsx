'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { AnimatedBackground } from '@/components/animated-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scissors } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const result = await authClient.signIn.email({ email, password })
    if (result.error) {
      setError('Email ou senha incorretos')
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
        <p className="mb-8 text-center text-muted-foreground">Fazer login</p>
        {error && <div role="alert" className="mb-4 rounded-lg border border-destructive/50 bg-destructive/20 p-3 text-sm text-destructive">{error}</div>}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} /></div>
          <div><label htmlFor="password" className="mb-2 block text-sm font-medium">Senha</label><Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} /></div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Entrando...' : 'Entrar'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">Não tem conta? <Link href="/sign-up" className="font-medium text-primary hover:underline">Criar conta</Link></p>
        <Link href="/" className="mt-4 block text-center text-sm text-primary hover:underline">Voltar</Link>
      </div>
    </main>
  )
}
