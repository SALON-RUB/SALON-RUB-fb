'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { Lock, Upload, Copy, CheckCircle2 } from 'lucide-react'
import { getSubscriptionStatus, submitSubscriptionProof } from '@/app/actions/subscription'

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [showTrialNotice, setShowTrialNotice] = useState(true)
  const [pending, startTransition] = useTransition()
  const pathname = usePathname()
  const allowed = pathname === '/dashboard/loyalty' || pathname === '/dashboard/assinatura'

  useEffect(() => { getSubscriptionStatus().then(setStatus).catch(() => setStatus({ active: false, subscription: { amount: '100.00', pixKey: '541af7f1-69e7-43a2-8922-e8b40cefe911', status: 'pending' } })) }, [])
  useEffect(() => {
    if (!status?.isFirstAccess) return
    const timer = window.setTimeout(() => setShowTrialNotice(false), 10000)
    return () => window.clearTimeout(timer)
  }, [status?.isFirstAccess])

  if (!status || allowed) return <>{children}</>

  const subscription = status.subscription
  if (status.active && status.isFirstAccess && showTrialNotice) {
    return <div className="relative min-h-full"><>{children}</><section className="fixed inset-x-4 bottom-6 z-30 mx-auto max-w-lg rounded-2xl border border-primary/50 bg-card p-5 text-center shadow-2xl"><h2 className="text-xl font-bold text-primary">SEU TESTE GRATUITO ACABA EM 3 DIAS</h2><p className="mt-2 text-sm text-muted-foreground">A partir de agora você pode usar todas as funções do salão. Depois de 3 dias, será necessário pagar a mensalidade de R$ 100,00.</p><p className="mt-3 text-xs text-muted-foreground">Vencimento do teste: {new Date(status.trialEndsAt).toLocaleString('pt-BR')}</p></section></div>
  }
  const sendProof = () => {
    if (!file) return setMessage('Selecione o comprovante primeiro.')
    startTransition(async () => {
      const form = new FormData(); form.append('file', file)
      const upload = await fetch('/api/subscription/proof', { method: 'POST', body: form })
      const data = await upload.json()
      if (!upload.ok) return setMessage(data.error || 'Erro ao enviar comprovante.')
      await submitSubscriptionProof(data.pathname)
      setMessage('Comprovante enviado. Aguarde a aprovação.')
    })
  }

  return <div className="relative min-h-full"><div className="pointer-events-none select-none opacity-30">{children}</div><section className="absolute inset-0 flex items-start justify-center bg-background/90 p-6 pt-16"><div className="pointer-events-auto flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-primary/40 bg-card p-6 text-center shadow-xl"><Lock className="mx-auto text-primary" /><h2 className="text-2xl font-bold">Mensalidade pendente</h2><p className="text-muted-foreground">Pague R$ 100,00 via Pix para desbloquear as funções do salão.</p><div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"><code>{subscription.pixKey}</code><button aria-label="Copiar chave Pix" onClick={() => navigator.clipboard.writeText(subscription.pixKey)}><Copy /></button></div><p className="text-sm text-muted-foreground">Mês de referência: {subscription.billingMonth}</p><label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4"><Upload />{file?.name || 'Selecionar comprovante'}<input className="sr-only" type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><button className="rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-50" disabled={pending} onClick={sendProof}>{pending ? 'Enviando...' : 'Enviar comprovante'}</button>{message && <p className="flex items-center justify-center gap-2 text-sm"><CheckCircle2 />{message}</p>}</div></section></div>
}
