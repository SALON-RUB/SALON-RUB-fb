'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons, appointments, services } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  return session.user.id
}

async function getSalonByCode(salonCode: string) {
  const salon = await db.query.salons.findFirst({
    where: eq(salons.salonCode, salonCode.toUpperCase()),
  })
  if (!salon) throw new Error('Código do salão não encontrado')
  return salon
}

export async function createAppointment(appointmentData: {
  salonCode: string
  clientName: string
  clientPhone: string
  serviceId: string
  appointmentDate: string
  appointmentTime: string
  notes?: string
}) {
  try {
    const salon = await getSalonByCode(appointmentData.salonCode)
    
    const service = await db.query.services.findFirst({
      where: eq(services.id, appointmentData.serviceId as any),
    })

    const newAppointment = await db
      .insert(appointments)
      .values({
        salonId: salon.id,
        serviceId: appointmentData.serviceId as any,
        clientName: appointmentData.clientName,
        clientPhone: appointmentData.clientPhone,
        appointmentDate: appointmentData.appointmentDate as any,
        appointmentTime: appointmentData.appointmentTime,
        duration: service?.duration || 30,
        price: service?.price,
        notes: appointmentData.notes || '',
        status: 'agendado',
      })
      .returning()

    revalidatePath('/cliente')
    return newAppointment[0]
  } catch (error) {
    console.error('[v0] Erro ao criar agendamento:', error)
    throw error
  }
}

export async function getAppointmentsBySalon() {
  try {
    const userId = await getUserId()
    
    const salon = await db.query.salons.findFirst({
      where: eq(salons.ownerId, userId),
    })
    if (!salon) throw new Error('Salão não encontrado')

    return db.query.appointments.findMany({
      where: eq(appointments.salonId, salon.id),
    })
  } catch (error) {
    console.error('[v0] Erro ao buscar agendamentos:', error)
    throw error
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string
) {
  try {
    const userId = await getUserId()
    
    const salon = await db.query.salons.findFirst({
      where: eq(salons.ownerId, userId),
    })
    if (!salon) throw new Error('Salão não encontrado')

    const updated = await db
      .update(appointments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(
        eq(appointments.salonId, salon.id) &&
        eq(appointments.id, appointmentId as any)
      )
      .returning()

    revalidatePath('/dashboard/agendamentos')
    return updated[0]
  } catch (error) {
    console.error('[v0] Erro ao atualizar agendamento:', error)
    throw error
  }
}

export async function cancelAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, 'cancelado')
}

export async function completeAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, 'concluido')
}

export async function getServicesBySalonCode(salonCode: string) {
  try {
    const salon = await getSalonByCode(salonCode)

    return db.query.services.findMany({
      where: eq(services.salonId, salon.id),
    })
  } catch (error) {
    console.error('[v0] Erro ao buscar serviços:', error)
    return []
  }
}
