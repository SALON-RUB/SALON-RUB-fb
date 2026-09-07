import { db } from '@/lib/db'
import { appointments, salons } from '@/lib/db/schema'
import { apiJson, normalizeCode, validDate } from '@/lib/public-api'
import { and, eq, ne } from 'drizzle-orm'
import { NextRequest } from 'next/server'

export async function OPTIONS() { return apiJson({ ok: true }) }

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const date = request.nextUrl.searchParams.get('date') || ''
  if (!validDate(date)) return apiJson({ error: 'Informe date no formato YYYY-MM-DD.' }, { status: 400 })
  const salon = await db.query.salons.findFirst({ where: eq(salons.salonCode, normalizeCode((await params).code)) })
  if (!salon) return apiJson({ error: 'Salão não encontrado.' }, { status: 404 })
  const booked = await db.select({ time: appointments.appointmentTime }).from(appointments).where(and(eq(appointments.salonId, salon.id), eq(appointments.appointmentDate, date), ne(appointments.status, 'cancelado')))
  return apiJson({ date, bookedTimes: booked.map((item) => item.time) })
}
