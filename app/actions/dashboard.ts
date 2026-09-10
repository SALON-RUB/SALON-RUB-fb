'use server'

import { and, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appointments, employees, salons, services } from '@/lib/db/schema'

async function getSalon() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  const salon = await db.query.salons.findFirst({ where: eq(salons.ownerId, session.user.id) })
  if (!salon) throw new Error('Salão não encontrado')
  return salon
}

export async function getDashboardStats() {
  const salon = await getSalon()
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [todayAppointments, todayRevenue, serviceCount, employeeCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(appointments).where(and(eq(appointments.salonId, salon.id), eq(appointments.appointmentDate, today), sql`${appointments.status} <> 'cancelado'`)),
    db.select({ total: sql<string>`coalesce(sum(${appointments.price}), 0)` }).from(appointments).where(and(eq(appointments.salonId, salon.id), eq(appointments.appointmentDate, today), sql`${appointments.status} in ('concluido', 'aceito')`)),
    db.select({ count: sql<number>`count(*)` }).from(services).where(eq(services.salonId, salon.id)),
    db.select({ count: sql<number>`count(*)` }).from(employees).where(eq(employees.salonId, salon.id)),
  ])
  return { appointmentsToday: Number(todayAppointments[0]?.count || 0), revenueToday: Number(todayRevenue[0]?.total || 0), services: Number(serviceCount[0]?.count || 0), employees: Number(employeeCount[0]?.count || 0) }
}
