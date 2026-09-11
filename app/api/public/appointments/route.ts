import { db } from '@/lib/db'
import { appointments, businessHours, salons, services } from '@/lib/db/schema'
import { apiJson, normalizeCode, validDate, validTime } from '@/lib/public-api'
import { and, eq, ne } from 'drizzle-orm'
import { NextRequest } from 'next/server'

export async function OPTIONS() { return apiJson({ ok: true }) }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const salonCode = typeof body.salonCode === 'string' ? normalizeCode(body.salonCode) : ''
    const clientName = typeof body.clientName === 'string' ? body.clientName.trim() : ''
    const clientPhone = typeof body.clientPhone === 'string' ? body.clientPhone.trim() : ''
    const serviceId = typeof body.serviceId === 'string' ? body.serviceId : ''
    const appointmentDate = typeof body.appointmentDate === 'string' ? body.appointmentDate : ''
    const appointmentTime = typeof body.appointmentTime === 'string' ? body.appointmentTime : ''
    if (!salonCode || !clientName || !clientPhone || !serviceId || !validDate(appointmentDate) || !validTime(appointmentTime)) return apiJson({ error: 'Dados inválidos. Preencha salão, cliente, telefone, serviço, data e horário corretamente.' }, { status: 400 })
    if (clientName.length > 255 || clientPhone.length > 20) return apiJson({ error: 'Nome ou telefone excede o limite permitido.' }, { status: 400 })
    const salon = await db.query.salons.findFirst({ where: eq(salons.salonCode, salonCode) })
    if (!salon) return apiJson({ error: 'Salão não encontrado.' }, { status: 404 })
    if (!salon.isActive) return apiJson({ error: 'Este salão está temporariamente indisponível.' }, { status: 403 })
    const service = await db.query.services.findFirst({ where: and(eq(services.id, serviceId), eq(services.salonId, salon.id)) })
    if (!service) return apiJson({ error: 'Serviço não encontrado neste salão.' }, { status: 404 })
    const dayOfWeek = new Date(`${appointmentDate}T12:00:00`).getDay()
    const dayKeys = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'] as const
    const configuredHours = (salon.settings as { horarios?: Record<string, { aberto?: boolean; horarioInicio?: string; horarioFim?: string }> } | null)?.horarios?.[dayKeys[dayOfWeek]]
    const legacyHours = await db.query.businessHours.findFirst({ where: and(eq(businessHours.salonId, salon.id), eq(businessHours.dayOfWeek, dayOfWeek)) })
    const openingTime = configuredHours?.horarioInicio || legacyHours?.openingTime || ''
    const closingTime = configuredHours?.horarioFim || legacyHours?.closingTime || ''
    const isOpen = configuredHours ? configuredHours.aberto === true : legacyHours?.isOpen === true
    const toMinutes = (value: string) => { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute }
    const start = toMinutes(appointmentTime)
    const duration = Math.max(15, service.duration || 30)
    if (!isOpen || !openingTime || !closingTime || start < toMinutes(openingTime) || start + duration > toMinutes(closingTime)) return apiJson({ error: 'Este horário não está dentro do funcionamento do salão.' }, { status: 409 })

    const existingAppointments = await db.query.appointments.findMany({ where: and(eq(appointments.salonId, salon.id), eq(appointments.appointmentDate, appointmentDate), ne(appointments.status, 'cancelado')) })
    const overlaps = existingAppointments.some((item) => {
      const bookedStart = toMinutes(item.appointmentTime)
      const bookedDuration = Math.max(15, item.duration || 30)
      return start < bookedStart + bookedDuration && start + duration > bookedStart
    })
    if (overlaps) return apiJson({ error: 'Este horário já foi reservado.' }, { status: 409 })
    const [appointment] = await db.insert(appointments).values({ salonId: salon.id, serviceId: service.id, clientName, clientPhone, appointmentDate, appointmentTime, duration: service.duration, price: service.price, notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 2000) : null }).returning()
    return apiJson({ appointment }, { status: 201 })
  } catch (error) {
    console.error('[v0] Erro na API pública de agendamento:', error)
    return apiJson({ error: 'Não foi possível criar o agendamento.' }, { status: 500 })
  }
}
