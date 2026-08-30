'use client'

import { useEffect, useState, useTransition } from 'react'
import { CheckCircle2, Clipboard, CreditCard, FileCheck2, LockKeyhole, Upload } from 'lucide-react'
import { getSubscriptionStatus, submitSubscriptionProof } from '@/app/actions/subscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FALLBACK_PIX = '541af7f1-69e7-43a2-8922-e8b40cefe911'

export default function AssinaturaPage() {
  const [status, setStatus] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    getSubscriptionStatus().then(setStatus).catch(() => setError('Não foi possível carregar a mensalidade.'))
  }, [])

  const subscription = status?.subscription
  const pixKey = subscription?.pixKey || FALLBACK_PIX
  const submitProof = () => {
    if (!file) {
      setError('Selecione o comprovante do pagamento.')
      return
    }
    setError('')
    startTransition(async () => {
      try {
        const form = new FormData()
        form.append('file', file)
        const upload = await fetch('/api/subscription/proof', { method: 'POST', body: form })
        const data = await upload.json()
        if (!upload.ok) throw new Error(data.error || 'Falha no upload.')
        await submitSubscriptionProof(data.pathname)
        setMessage('Comprovante enviado. Aguarde a aprovação para desbloquear o salão.')
        setStatus((current: any) => current ? { ...current, subscription: { ...current.subscription, status: 'pending' } } : current)
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : 'Não foi possível enviar o comprovante.')
      }
    })
  }

  const copyPix = async () => {
    await navigator.clipboard.writeText(pixKey)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-medium text-primary">Área do salão</p>
        <h1 className="text-3xl font-bold tracking-tight">Mensalidade</h1>
        <p className="mt-2 text-muted-foreground">Pague e envie o comprovante sem sair do seu salão.</p>
      </header>

      {status?.trialActive && (
        <Card className="border-primary/40 bg-primary/10">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="text-primary" />Teste gratuito ativo</CardTitle><CardDescription>Seu teste termina em {new Date(status.trialEndsAt).toLocaleString('pt-BR')}.</CardDescription></CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" />Pagamento mensal via Pix</CardTitle><CardDescription>Valor fixo de R$ 100,00 para liberar os recursos administrativos.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2"><Label htmlFor="pix-key">Chave Pix</Label><div className="flex gap-2"><Input id="pix-key" readOnly value={pixKey} /><Button type="button" variant="outline" onClick={copyPix}>{copied ? <CheckCircle2 data-icon="inline-start" /> : <Clipboard data-icon="inline-start" />}{copied ? 'Copiada' : 'Copiar'}</Button></div></div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm"><p><strong>Mês de referência:</strong> {subscription?.billingMonth || 'Mês atual'}</p><p className="mt-1"><strong>Status:</strong> {subscription?.status === 'approved' ? 'Pagamento aprovado' : 'Aguardando comprovante/aprovação'}</p></div>
          <div className="flex flex-col gap-2"><Label htmlFor="proof">Comprovante de pagamento</Label><Input id="proof" type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} /><p className="text-xs text-muted-foreground">Imagem ou PDF de até 5 MB.</p></div>
          <Button type="button" size="lg" disabled={pending || !file} onClick={submitProof}>{pending ? 'Enviando comprovante...' : <><Upload data-icon="inline-start" />Enviar comprovante</>}</Button>
          {message && <p className="flex items-center gap-2 text-sm text-primary"><FileCheck2 />{message}</p>}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </CardContent>
      </Card>

      {status && !status.active && <Card className="border-destructive/40"><CardContent className="flex items-start gap-3 p-5 text-sm"><LockKeyhole className="mt-0.5 text-destructive" /><p>As funções do salão permanecem bloqueadas até a aprovação do pagamento. O Loyalty continua disponível.</p></CardContent></Card>}
    </main>
  )
}
