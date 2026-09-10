'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, CreditCard, ExternalLink, LockKeyhole } from 'lucide-react'
import { getSubscriptionStatus } from '@/app/actions/subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AssinaturaPage() {
  const router = useRouter()
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSubscriptionStatus().then(setStatus).catch(() => setError('Não foi possível carregar a mensalidade.'))
  }, [])

  const subscription = status?.subscription
  const checkoutUrl = `https://pay.kiwify.com.br/2i2zp9y?codigo_salao=${encodeURIComponent(status?.salonCode || '')}`

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-primary">Área do salão</p>
        <h1 className="text-3xl font-bold tracking-tight">Mensalidade</h1>
        <p className="mt-2 text-muted-foreground">Pague sua mensalidade com segurança pela Kiwify.</p></div><Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>Voltar ao início</Button>
      </header>

      {status?.trialActive && (
        <Card className="border-primary/40 bg-primary/10">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="text-primary" />Teste gratuito ativo</CardTitle><CardDescription>Seu teste termina em {new Date(status.trialEndsAt).toLocaleString('pt-BR')}.</CardDescription></CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" />Pagamento mensal via Kiwify</CardTitle><CardDescription>Valor fixo de R$ 29,99 para liberar os recursos administrativos.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm"><p><strong>Mês de referência:</strong> {subscription?.billingMonth || 'Mês atual'}</p><p className="mt-1"><strong>Status:</strong> {subscription?.status === 'approved' ? 'Pagamento aprovado' : subscription?.status === 'pending_approval' ? 'Pagamento recebido, aguardando aprovação ADM' : 'Pagamento pendente'}</p></div>
          <Button type="button" size="lg" asChild><a href={checkoutUrl} target="_blank" rel="noreferrer"><ExternalLink data-icon="inline-start" />Realizar pagamento agora</a></Button>
          <p className="text-xs text-muted-foreground">Você será direcionado para a página segura da Kiwify. Após a confirmação, o pagamento será analisado pelo painel ADM antes da liberação do salão.</p>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </CardContent>
      </Card>

      {status && !status.active && <Card className="border-destructive/40"><CardContent className="flex items-start gap-3 p-5 text-sm"><LockKeyhole className="mt-0.5 text-destructive" /><p>As funções do salão permanecem bloqueadas até a aprovação do pagamento. O Loyalty continua disponível.</p></CardContent></Card>}
    </main>
  )
}
