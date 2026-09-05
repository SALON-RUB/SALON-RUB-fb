'use server'

import { and, desc, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { salons, salonSubscriptions, user } from '@/lib/db/schema'

const ADMIN_PASSWORD = '259610'
const ADMIN_COOKIE = 'salon_rub_admin'

export async function authenticateAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) return { ok: false, error: 'Senha incorreta.' }
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, 'authenticated', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 8, path: '/' })
  return { ok: true }
}

async function requireAdmin() {
  const jar = await cookies()
  if (jar.get(ADMIN_COOKIE)?.value !== 'authenticated') throw new Error('Não autorizado')
}

export async function getAdminSalons() {
  await requireAdmin()
  return db.select({ id: salons.id, name: salons.name, phone: salons.phone, salonCode: salons.salonCode, isActive: salons.isActive, createdAt: salons.createdAt, ownerEmail: user.email, ownerName: user.name, proofPath: salonSubscriptions.proofPath, paymentStatus: salonSubscriptions.status, billingMonth: salonSubscriptions.billingMonth }).from(salons).leftJoin(user, eq(user.id, salons.ownerId)).leftJoin(salonSubscriptions, and(eq(salonSubscriptions.salonId, salons.id), eq(salonSubscriptions.billingMonth, `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}-01`))).orderBy(desc(salons.createdAt))
}

export async function setSalonActive(salonId: string, isActive: boolean) {
  await requireAdmin()
  await db.update(salons).set({ isActive, updatedAt: new Date() }).where(eq(salons.id, salonId))
  revalidatePath('/admin')
  return { ok: true }
}

export async function approveSubscription(salonId: string) {
  await requireAdmin()
  const now = new Date()
  const pendingSubscription = await db.select({ id: salonSubscriptions.id }).from(salonSubscriptions).where(and(eq(salonSubscriptions.salonId, salonId), eq(salonSubscriptions.status, 'pending'))).orderBy(desc(salonSubscriptions.createdAt)).limit(1)
  if (!pendingSubscription[0]) return { ok: false, error: 'Comprovante pendente não encontrado.' }

  await db.update(salonSubscriptions).set({ status: 'approved', reviewedAt: now, reviewedBy: 'admin', updatedAt: now }).where(eq(salonSubscriptions.id, pendingSubscription[0].id))
  await db.update(salons).set({ isActive: true, updatedAt: now }).where(eq(salons.id, salonId))
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/assinatura')
  return { ok: true }
}

export async function adminLogout() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
}
