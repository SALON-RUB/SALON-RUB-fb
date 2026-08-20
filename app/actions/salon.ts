'use server'

import crypto from 'crypto'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons } from '@/lib/db/schema'

// Simular localStorage no servidor (em client components, localStorage real será usado)
const storageMap: { [key: string]: string } = {}

function getStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }
  return storageMap[key] || null
}

function setStorage(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value)
  } else {
    storageMap[key] = value
  }
}

export async function createSalonIfNotExists(userId: string, name: string = 'Meu Salão') {
  try {
    // Buscar dono no localStorage
    const accounts = JSON.parse(getStorage('owner_accounts') || '[]')
    const account = accounts.find((acc: any) => acc.userId === userId)

    if (!account) {
      return null
    }

    // Se já tem salonCode, retornar
    if (account.salonCode) {
      return {
        id: `salon_${account.userId}`,
        name: account.nomeSalao,
        salonCode: account.salonCode,
      }
    }

    return null
  } catch (error) {
    console.error('[v0] Erro ao criar salão:', error)
    return null
  }
}

export async function getSalonByCode(code: string) {
  try {
    const accounts = JSON.parse(getStorage('owner_accounts') || '[]')
    const account = accounts.find((acc: any) => acc.salonCode === code)

    if (account) {
      return {
        id: `salon_${account.userId}`,
        name: account.nomeSalao,
        salonCode: account.salonCode,
      }
    }

    return null
  } catch (error) {
    console.error('[v0] Erro ao buscar salão:', error)
    return null
  }
}

export async function getSalonById(salonId: string) {
  try {
    const accounts = JSON.parse(getStorage('owner_accounts') || '[]')
    const account = accounts.find((acc: any) => `salon_${acc.userId}` === salonId)

    if (account) {
      return {
        id: salonId,
        name: account.nomeSalao,
        salonCode: account.salonCode,
      }
    }

    return null
  } catch (error) {
    console.error('[v0] Erro ao buscar salão:', error)
    return null
  }
}

async function getAuthenticatedUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Não autorizado')
  return session.user.id
}

export async function getSalonSettings() {
  const userId = await getAuthenticatedUserId()
  const result = await db.select({ id: salons.id, settings: salons.settings }).from(salons).where(eq(salons.ownerId, userId)).limit(1)
  return result[0] ?? null
}

export async function saveSalonSettings(settings: Record<string, unknown>) {
  const userId = await getAuthenticatedUserId()
  const result = await db.update(salons)
    .set({ settings, updatedAt: new Date() })
    .where(and(eq(salons.ownerId, userId)))
    .returning({ id: salons.id, settings: salons.settings })
  if (!result[0]) throw new Error('Salão não encontrado')
  return result[0]
}

export async function addService(salonId: string, service: any) {
  try {
    const services = JSON.parse(getStorage('services') || '[]')
    
    const newService = {
      id: crypto.randomUUID(),
      salonId,
      ...service,
      createdAt: new Date().toISOString(),
    }

    services.push(newService)
    setStorage('services', JSON.stringify(services))

    return newService
  } catch (error) {
    console.error('[v0] Erro ao adicionar serviço:', error)
    throw error
  }
}

export async function getServicesBySalon(salonId: string) {
  try {
    const services = JSON.parse(getStorage('services') || '[]')
    return services.filter((s: any) => s.salonId === salonId)
  } catch (error) {
    console.error('[v0] Erro ao buscar serviços:', error)
    return []
  }
}

export async function updateService(serviceId: string, salonId: string, updates: any) {
  try {
    const services = JSON.parse(getStorage('services') || '[]')
    const index = services.findIndex((s: any) => s.id === serviceId && s.salonId === salonId)

    if (index >= 0) {
      services[index] = {
        ...services[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      setStorage('services', JSON.stringify(services))
      return services[index]
    }

    throw new Error('Serviço não encontrado')
  } catch (error) {
    console.error('[v0] Erro ao atualizar serviço:', error)
    throw error
  }
}

export async function deleteService(serviceId: string, salonId: string) {
  try {
    const services = JSON.parse(getStorage('services') || '[]')
    const filtered = services.filter((s: any) => !(s.id === serviceId && s.salonId === salonId))
    setStorage('services', JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('[v0] Erro ao deletar serviço:', error)
    throw error
  }
}
