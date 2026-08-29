'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appointments, salons } from '@/lib/db/schema'
import { and, eq, gte, lt, desc } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getSalon() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  const salon = await db.query.salons.findFirst({ where: eq(salons.ownerId, session.user.id) })
  if (!salon) throw new Error('Salão não encontrado')
  return salon
}

const validStatuses = ['confirmado', 'concluído', 'concluido', 'finalizado', 'realizado', 'completed']

export async function getLoyaltyStats() {
  const salon = await getSalon()
  const all = await db.query.appointments.findMany({
    where: eq(appointments.salonId, salon.id),
    orderBy: [desc(appointments.appointmentDate), desc(appointments.createdAt)],
  })
  const valid = all.filter((a) => validStatuses.includes((a.status || '').toLowerCase()))
  const points = (price: string | null) => Math.max(0, Math.floor(Number.parseFloat(price || '0')))
  const totalPoints = valid.reduce((sum, a) => sum + points(a.price), 0)
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10)
  const monthPoints = valid.filter((a) => a.appointmentDate >= start && a.appointmentDate < next).reduce((sum, a) => sum + points(a.price), 0)
  const clients = new Set(valid.map((a) => `${a.clientName}|${a.clientPhone}`))
  return {
    totalPoints,
    pointsThisMonth: monthPoints,
    activeClients: clients.size,
    transactions: valid.slice(0, 5).map((a) => ({ id: a.id, clientName: a.clientName, points: points(a.price), date: a.appointmentDate })),
  }
}

export async function getClientLoyaltyByPhone(phone: string) {
  const salon = await getSalon()
  const rows = await db.query.appointments.findMany({ where: and(eq(appointments.salonId, salon.id), eq(appointments.clientPhone, phone)) })
  const valid = rows.filter((a) => validStatuses.includes((a.status || '').toLowerCase()))
  return { points: valid.reduce((sum, a) => sum + Math.max(0, Math.floor(Number.parseFloat(a.price || '0'))), 0), visits: valid.length }
}
