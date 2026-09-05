'use client'

import { useEffect, useState, useTransition } from 'react'
import { Check, LockKeyhole, Power, RefreshCw, ShieldCheck } from 'lucide-react'
import { authenticateAdmin, approveSubscription, getAdminSalons, setSalonActive } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [salons, setSalons] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  const load = () => startTransition(async () => { try { setSalons(await getAdminSalons()); setAuthenticated(true) } catch { setAuthenticated(false) } })
  useEffect(() => { load() }, [])

  const login = () => startTransition(async () => { const result = await authenticateAdmin(password); if (!result.ok) return setMessage(result.error || 'Acesso negado.'); setMessage(''); load() })
  const toggle = (salon: any) => startTransition(async () => { await setSalonActive(salon.id, !salon.isActive); load() })
  const approve = (salon: any) => startTransition(async () => { try { const result = await approveSubscription(salon.id); if (!result.ok) { setMessage(result.error || 'Não foi possível aprovar o comprovante.'); return } setMessage('Comprovante aprovado e salão liberado até o fim do mês.'); load() } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível aprovar o comprovante.') } })

  if (!authenticated) return <main className="flex min-h-screen items-center justify-center bg-background p-6"><Card className="w-full max-w-md"><CardHeader><ShieldCheck className="text-primary" /><CardTitle>Painel ADM</CardTitle></CardHeader><CardContent className="flex flex-col gap-4"><p className="text-sm text-muted-foreground">Digite a senha administrativa para continuar.</p><Input type="password" placeholder="Senha ADM" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) login() }} /><Button onClick={login} disabled={pending}><LockKeyhole data-icon="inline-start" />Entrar</Button>{message && <p className="text-sm text-destructive" role="alert">{message}</p>}</CardContent></Card></main>

  return <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6"><header className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-primary">Controle da plataforma</p><h1 className="text-3xl font-bold">Painel ADM</h1><p className="text-muted-foreground">Salões cadastrados e comprovantes deste mês.</p></div><Button variant="outline" onClick={load}><RefreshCw data-icon="inline-start" />Atualizar</Button></header>{message && <p className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-primary">{message}</p>}<section className="grid gap-4">{salons.map((salon) => <Card key={salon.id}><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><h2 className="font-semibold">{salon.name}</h2><p className="text-sm text-muted-foreground">{salon.ownerName || 'Sem nome'} · {salon.ownerEmail}</p><p className="text-xs text-muted-foreground">Código: {salon.salonCode} · Status: {salon.isActive ? 'Ativo' : 'Desativado'}</p>{salon.proofPath && <p className="mt-2 text-sm text-primary">Comprovante enviado · {salon.paymentStatus}</p>}</div><div className="flex flex-wrap gap-2"><Button variant={salon.isActive ? 'outline' : 'default'} onClick={() => toggle(salon)} disabled={pending}><Power data-icon="inline-start" />{salon.isActive ? 'Desativar' : 'Ativar'}</Button>{salon.proofPath && salon.paymentStatus !== 'approved' && <Button onClick={() => approve(salon)} disabled={pending}><Check data-icon="inline-start" />Aceitar comprovante</Button>}</div></CardContent></Card>)}{salons.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum salão cadastrado.</CardContent></Card>}</section></main>
}
