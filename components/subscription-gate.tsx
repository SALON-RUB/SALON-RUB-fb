'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ExternalLink, Lock } from 'lucide-react'
import { getSubscriptionStatus } from '@/app/actions/subscription'

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<any>(null)
  const pathname = usePathname()
  const allowed = pathname === '/dashboard/loyalty' || pathname === '/dashboard/assinatura'

  useEffect(() => {
    getSubscriptionStatus().then(setStatus).catch(() => setStatus({ active: false, subscription: { amount: '29.99', status: 'pending' } }))
  }, [])

  if (!status) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Verificando assinatura...</div>
  if (allowed || status.active) return <>{children}</>

  const subscription = status.subscription
  return <div className="flex min-h-screen items-center justify-center p-4">
    <section className="w-full max-w-lg rounded-2xl border border-primary/40 bg-card p-6 text-center shadow-xl">
      <Lock className="mx-auto text-primary" />
      <h2 className="text-2xl font-bold">Mensalidade pendente</h2>
      <p className="text-sm text-muted-foreground">Realize o pagamento pela Kiwify para liberar o uso completo. A liberação acontece automaticamente após a confirmação do pagamento.</p>
      <p className="text-sm text-muted-foreground">Mês de referência: {subscription.billingMonth}</p>
      <a className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground" href={`https://pay.kiwify.com.br/2i2zp9y?codigo_salao=${encodeURIComponent(status?.salonCode || '')}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Realizar pagamento agora</a>
    </section>
  </div>
}
