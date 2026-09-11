import { db } from '@/lib/db'
import { appointments, businessHours, salons, services } from '@/lib/db/schema'
import { apiJson, normalizeCode, validDate } from '@/lib/public-api'
import { and, eq, ne } from 'drizzle-orm'
import { NextRequest } from 'next/server'

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function toTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}

export async function OPTIONS() { return apiJson({ ok: true }) }

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const date = request.nextUrl.searchParams.get('date') || ''
    const serviceId = request.nextUrl.searchParams.get('serviceId') || ''
    if (!validDate(date) || !serviceId) return apiJson({ error: 'Informe uma data e um serviço válidos.' }, { status: 400 })

    const salon = await db.query.salons.findFirst({ where: eq(salons.salonCode, normalizeCode((await params).code)) })
    if (!salon) return apiJson({ error: 'Salão não encontrado.' }, { status: 404 })
    if (!salon.isActive) return apiJson({ error: 'Este salão está temporariamente indisponível.' }, { status: 403 })

    const service = await db.query.services.findFirst({ where: and(eq(services.id, serviceId), eq(services.salonId, salon.id)) })
    if (!service) return apiJson({ error: 'Serviço não encontrado neste salão.' }, { status: 404 })

    const dayOfWeek = new Date(`${date}T12:00:00`).getDay()
    const dayKeys = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'] as const
    const configuredHours = (salon.settings as { horarios?: Record<string, { aberto?: boolean; horarioInicio?: string; horarioFim?: string }> } | null)?.horarios?.[dayKeys[dayOfWeek]]
    const legacyHours = await db.query.businessHours.findFirst({ where: and(eq(businessHours.salonId, salon.id), eq(businessHours.dayOfWeek, dayOfWeek)) })
    const openingTime = configuredHours?.horarioInicio || legacyHours?.openingTime || ''
    const closingTime = configuredHours?.horarioFim || legacyHours?.closingTime || ''
    const isOpen = configuredHours ? configuredHours.aberto === true : legacyHours?.isOpen === true
    if (!isOpen || !openingTime || !closingTime) return apiJson({ date, serviceId, availableTimes: [], bookedTimes: [] })

    const booked = await db.select({ time: appointments.appointmentTime, duration: appointments.duration }).from(appointments).where(and(eq(appointments.salonId, salon.id), eq(appointments.appointmentDate, date), ne(appointments.status, 'cancelado')))
    const duration = Math.max(15, service.duration || 30)
    const opening = toMinutes(openingTime)
    const closing = toMinutes(closingTime)
    const availableTimes: string[] = []
    for (let start = opening; start + duration <= closing; start += duration) {
      const time = toTime(start)
      const overlaps = booked.some((item) => {
        const bookedStart = toMinutes(item.time)
        const bookedEnd = bookedStart + Math.max(15, item.duration || 30)
        return start < bookedEnd && start + duration > bookedStart
      })
      if (!overlaps) availableTimes.push(time)
    }

    return apiJson({ date, serviceId, availableTimes, bookedTimes: booked.map((item) => item.time) })
  } catch (error) {
    console.error('[v0] Erro ao buscar disponibilidade:', error)
    return apiJson({ error: 'Não foi possível carregar os horários.' }, { status: 500 })
  }
}
