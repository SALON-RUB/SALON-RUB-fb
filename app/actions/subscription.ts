'use server'

import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons, salonSubscriptions } from '@/lib/db/schema'

const PIX_KEY = '541af7f1-69e7-43a2-8922-e8b40cefe911'
const AMOUNT = '100.00'

async function getSalon() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  const result = await db.select({ id: salons.id, createdAt: salons.createdAt, trialStartedAt: salons.trialStartedAt }).from(salons).where(eq(salons.ownerId, session.user.id)).limit(1)
  if (!result[0]) throw new Error('Salão não encontrado')
  return result[0]
}

function currentMonth() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
}

export async function getSubscriptionStatus() {
  let salon = await getSalon()
  if (!salon.trialStartedAt) {
    const startedAt = new Date()
    await db.update(salons).set({ trialStartedAt: startedAt, updatedAt: startedAt }).where(eq(salons.id, salon.id))
    salon = { ...salon, trialStartedAt: startedAt }
  }
  const month = currentMonth()
  const rows = await db.select().from(salonSubscriptions).where(and(eq(salonSubscriptions.salonId, salon.id), eq(salonSubscriptions.billingMonth, month))).limit(1)
  const subscription = rows[0]
  const trialStartedAt = new Date(salon.trialStartedAt as Date)
  const trialEndsAt = new Date(trialStartedAt.getTime() + 3 * 24 * 60 * 60 * 1000)
  const trialActive = Date.now() < trialEndsAt.getTime()
  const active = subscription?.status === 'approved' || trialActive
  return { active, trialActive, isFirstAccess: !subscription && trialActive, trialStartedAt: trialStartedAt.toISOString(), trialEndsAt: trialEndsAt.toISOString(), subscription: subscription ?? { amount: AMOUNT, pixKey: PIX_KEY, billingMonth: month, status: 'pending' } }
}

export async function submitSubscriptionProof(proofPath: string) {
  if (!proofPath || proofPath.length > 500) throw new Error('Comprovante inválido')
  const salon = await getSalon()
  const month = currentMonth()
  await db.insert(salonSubscriptions).values({ salonId: salon.id, billingMonth: month, amount: AMOUNT, pixKey: PIX_KEY, status: 'pending', proofPath, submittedAt: new Date(), updatedAt: new Date() }).onConflictDoUpdate({ target: [salonSubscriptions.salonId, salonSubscriptions.billingMonth], set: { proofPath, status: 'pending', submittedAt: new Date(), updatedAt: new Date() } })
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function getSubscriptionHistory() {
  const salon = await getSalon()
  return db.select().from(salonSubscriptions).where(eq(salonSubscriptions.salonId, salon.id)).orderBy(desc(salonSubscriptions.billingMonth))
}

export async function getSubscriptionConstants() {
  return { pixKey: PIX_KEY, amount: AMOUNT }
}
