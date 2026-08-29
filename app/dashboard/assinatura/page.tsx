import { CreditCard } from 'lucide-react'

export default function AssinaturaPage() {
  return <section className="mx-auto flex max-w-3xl flex-col gap-6 p-6"><div><p className="text-sm text-primary">Assinatura</p><h1 className="text-3xl font-bold">Mensalidade do salão</h1></div><div className="rounded-2xl border border-border bg-card p-6"><CreditCard className="mb-4 text-primary" /><h2 className="text-xl font-semibold">Pagamento mensal via Pix</h2><p className="mt-2 text-muted-foreground">Envie o comprovante para liberar as funções administrativas do seu salão.</p></div></section>
}
