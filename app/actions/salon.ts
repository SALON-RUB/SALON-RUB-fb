'use server'

import { db } from '@/lib/db'
import { salons, services } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createSalonIfNotExists(ownerId: string, ownerName: string = 'Meu Salão') {
  try {
    const existing = await db
      .select()
      .from(salons)
      .where(eq(salons.ownerId, ownerId as any))

    if (existing.length > 0) {
      return existing[0]
    }

    const salonCode = Math.random().toString(36).slice(2, 8).toUpperCase()
    const newSalon = await db
      .insert(salons)
      .values({
        ownerId: ownerId as any,
        name: `Salão de ${ownerName}`,
        salonCode: salonCode,
      })
      .returning()

    return newSalon[0]
  } catch (error) {
    console.error('[v0] Erro ao criar salão:', error)
    return null
  }
}

export async function getSalonByCode(code: string) {
  try {
    const result = await db
      .select()
      .from(salons)
      .where(eq(salons.salonCode, code.toUpperCase()))

    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('[v0] Erro ao buscar salão:', error)
    return null
  }
}

export async function getSalonById(salonId: string) {
  try {
    const result = await db
      .select()
      .from(salons)
      .where(eq(salons.id, salonId as any))

    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('[v0] Erro ao buscar salão:', error)
    return null
  }
}

export async function addService(salonId: string, serviceData: any) {
  try {
    const newService = await db
      .insert(services)
      .values({
        salonId: salonId as any,
        name: serviceData.name || 'Serviço',
        category: serviceData.category || 'Geral',
        duration: parseInt(serviceData.duration) || 30,
        price: (parseFloat(serviceData.price) || 0).toString(),
      } as any)
      .returning()

    revalidatePath('/dashboard/servicos')
    return newService[0]
  } catch (error) {
    console.error('[v0] Erro ao adicionar serviço:', error)
    throw error
  }
}

export async function getServicesBySalon(salonId: string) {
  try {
    return await db
      .select()
      .from(services)
      .where(eq(services.salonId, salonId as any))
  } catch (error) {
    console.error('[v0] Erro ao buscar serviços:', error)
    return []
  }
}

export async function updateService(serviceId: string, salonId: string, updates: any) {
  try {
    const updated = await db
      .update(services)
      .set({
        name: updates.name || 'Serviço',
        category: updates.category || 'Geral',
        duration: parseInt(updates.duration) || 30,
        price: (parseFloat(updates.price) || 0).toString(),
        updatedAt: new Date(),
      } as any)
      .where(eq(services.id, serviceId as any))
      .returning()

    revalidatePath('/dashboard/servicos')
    return updated[0]
  } catch (error) {
    console.error('[v0] Erro ao atualizar serviço:', error)
    throw error
  }
}

export async function deleteService(serviceId: string, salonId: string) {
  try {
    await db.delete(services).where(eq(services.id, serviceId as any))
    revalidatePath('/dashboard/servicos')
  } catch (error) {
    console.error('[v0] Erro ao deletar serviço:', error)
    throw error
  }
}
