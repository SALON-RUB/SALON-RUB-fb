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

  if (!status || allowed || status.active) return <>{children}</>

  const subscription = status.subscription
  return <div className="relative min-h-full pb-40">
    {children}
    <section className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-primary/40 bg-card p-5 text-center shadow-xl">
      <Lock className="mx-auto text-primary" />
      <h2 className="text-2xl font-bold">Mensalidade pendente</h2>
      <p className="text-sm text-muted-foreground">Realize o pagamento pela Kiwify para liberar o uso completo. Depois, o painel ADM confirmará a liberação.</p>
      <p className="text-sm text-muted-foreground">Mês de referência: {subscription.billingMonth}</p>
      <a className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground" href={`https://pay.kiwify.com.br/2i2zp9y?codigo_salao=${encodeURIComponent(status?.salonCode || '')}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Realizar pagamento agora</a>
    </section>
  </div>
}
