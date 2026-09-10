import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { salons, salonSubscriptions } from '@/lib/db/schema'

const MONTHLY_AMOUNT = '29.99'
const PRODUCT_ID = process.env.KIWIFY_PRODUCT_ID
const WEBHOOK_TOKEN = process.env.KIWIFY_WEBHOOK_TOKEN

function readValue(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = key.split('.').reduce<unknown>((current, part) => current && typeof current === 'object' ? (current as Record<string, unknown>)[part] : undefined, payload)
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function currentMonth() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
}

export async function POST(request: Request) {
  if (!WEBHOOK_TOKEN) return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 })
  const providedToken = request.headers.get('x-kiwify-token') || request.headers.get('x-webhook-token')
  if (providedToken !== WEBHOOK_TOKEN) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const payload = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!payload) return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })

  const event = readValue(payload, ['event', 'webhook_event_type', 'type', 'data.event'])?.toLowerCase()
  if (event !== 'compra_aprovada' && event !== 'purchase_approved' && event !== 'approved') return NextResponse.json({ received: true, ignored: true })

  const productId = readValue(payload, ['product.id', 'product_id', 'data.product.id', 'data.product_id'])
  if (PRODUCT_ID && productId && productId !== PRODUCT_ID) return NextResponse.json({ error: 'Produto não corresponde.' }, { status: 422 })

  const salonCode = readValue(payload, ['custom_fields.codigo_salao', 'custom_fields.salon_code', 'metadata.salonCode', 'metadata.salon_code', 'codigo_salao', 'salon_code', 'salonCode'])?.toUpperCase()
  if (!salonCode) return NextResponse.json({ error: 'Código do salão não informado.' }, { status: 422 })

  const salon = (await db.select({ id: salons.id }).from(salons).where(eq(salons.salonCode, salonCode)).limit(1))[0]
  if (!salon) return NextResponse.json({ error: 'Salão não encontrado.' }, { status: 404 })

  const now = new Date()
  const month = currentMonth()
  await db.insert(salonSubscriptions).values({ salonId: salon.id, billingMonth: month, amount: MONTHLY_AMOUNT, pixKey: 'KIWIFY', status: 'pending_approval', submittedAt: now, updatedAt: now }).onConflictDoUpdate({ target: [salonSubscriptions.salonId, salonSubscriptions.billingMonth], set: { amount: MONTHLY_AMOUNT, status: 'pending_approval', submittedAt: now, reviewedAt: null, reviewedBy: null, updatedAt: now } })
  await db.update(salons).set({ isActive: false, updatedAt: now }).where(eq(salons.id, salon.id))

  return NextResponse.json({ ok: true, salonId: salon.id, billingMonth: month })
}

export async function GET() {
  return NextResponse.json({ endpoint: 'Kiwify webhook', event: 'compra_aprovada' })
}
