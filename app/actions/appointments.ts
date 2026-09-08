'use server'

import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appointments, salons } from '@/lib/db/schema'

async function getSalonForUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  const salon = await db.query.salons.findFirst({ where: eq(salons.ownerId, session.user.id) })
  if (!salon) throw new Error('Salão não encontrado')
  return salon
}

export async function createAppointment(data: { salonCode: string; clientName: string; clientPhone: string; serviceId: string; appointmentDate: string; appointmentTime: string; notes?: string }) {
  const response = await fetch(`${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/public/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), cache: 'no-store' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Não foi possível criar o agendamento')
  return result.appointment
}

export async function getAppointmentsBySalon() {
  const salon = await getSalonForUser()
  return db.query.appointments.findMany({ where: eq(appointments.salonId, salon.id), with: { service: true }, orderBy: [desc(appointments.appointmentDate), desc(appointments.appointmentTime)] })
}

export async function updateAppointmentStatus(id: string, status: string) {
  const salon = await getSalonForUser()
  const [appointment] = await db.update(appointments).set({ status, updatedAt: new Date() }).where(and(eq(appointments.id, id), eq(appointments.salonId, salon.id))).returning()
  if (!appointment) throw new Error('Agendamento não encontrado')
  return appointment
}

export async function cancelAppointment(id: string) { return updateAppointmentStatus(id, 'cancelado') }
export async function completeAppointment(id: string) { return updateAppointmentStatus(id, 'concluido') }
