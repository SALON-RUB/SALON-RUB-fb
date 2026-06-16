'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons, services } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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

  revalidatePath('/dashboard/servicos')
  return newService[0]
}

export async function getServices() {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  return db.query.services.findMany({
    where: eq(services.salonId, salon.id),
  })
}

export async function updateService(
  serviceId: string,
  serviceData: {
    name: string
    category: string
    duration: number
    price: string
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
      eq(services.salonId, salon.id) && eq(services.id, serviceId as any)
    )
    .returning()

  revalidatePath('/dashboard/servicos')
  return updated[0]
}

export async function deleteService(serviceId: string) {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  await db
    .delete(services)
    .where(
      eq(services.salonId, salon.id) && eq(services.id, serviceId as any)
    )

  revalidatePath('/dashboard/servicos')
}
