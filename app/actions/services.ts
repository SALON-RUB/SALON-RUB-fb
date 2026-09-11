'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons, services } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  return session.user.id
}

async function getSalonByUserId(userId: string) {
  const salon = await db.query.salons.findFirst({
    where: eq(salons.ownerId, userId),
  })
  if (!salon) throw new Error('Salão não encontrado')
  return salon
}

export async function createService(serviceData: {
  name: string
  category: string
  duration: number
  price: string
  imageUrl?: string
}) {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  const newService = await db
    .insert(services)
    .values({
      salonId: salon.id,
      name: serviceData.name,
      category: serviceData.category,
      duration: serviceData.duration,
      price: serviceData.price,
    })
    .returning()

  if (serviceData.imageUrl) {
    const settings = (salon.settings || {}) as Record<string, unknown>
    const serviceImages = { ...((settings.serviceImages || {}) as Record<string, string>), [newService[0].id]: serviceData.imageUrl }
    await db.update(salons).set({ settings: { ...settings, serviceImages }, updatedAt: new Date() }).where(eq(salons.id, salon.id))
  }

  revalidatePath('/dashboard/servicos')
  return newService[0]
}

export async function getServices() {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  const rows = await db.query.services.findMany({ where: eq(services.salonId, salon.id) })
  const serviceImages = ((salon.settings || {}) as Record<string, unknown>).serviceImages as Record<string, string> | undefined
  return rows.map((service) => ({ ...service, imageUrl: serviceImages?.[service.id] || '' }))
}

export async function updateService(
  serviceId: string,
  serviceData: {
    name: string
    category: string
    duration: number
    price: string
    imageUrl?: string
  }
) {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  const updated = await db
    .update(services)
    .set({
      name: serviceData.name,
      category: serviceData.category,
      duration: serviceData.duration,
      price: serviceData.price,
      updatedAt: new Date(),
    })
    .where(
      and(eq(services.salonId, salon.id), eq(services.id, serviceId))
    )
    .returning()

  if (serviceData.imageUrl) {
    const settings = (salon.settings || {}) as Record<string, unknown>
    const serviceImages = { ...((settings.serviceImages || {}) as Record<string, string>), [serviceId]: serviceData.imageUrl }
    await db.update(salons).set({ settings: { ...settings, serviceImages }, updatedAt: new Date() }).where(eq(salons.id, salon.id))
  }

  revalidatePath('/dashboard/servicos')
  return updated[0]
}

export async function deleteService(serviceId: string) {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  await db
    .delete(services)
    .where(
      and(eq(services.salonId, salon.id), eq(services.id, serviceId))
    )

  revalidatePath('/dashboard/servicos')
}
