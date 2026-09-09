import { db } from '@/lib/db'
import { appointments, salons, services } from '@/lib/db/schema'
import { apiJson, normalizeCode } from '@/lib/public-api'
import { desc, eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    const salonCode = normalizeCode(code)
    const salon = await db.query.salons.findFirst({ where: eq(salons.salonCode, salonCode) })
    if (!salon) return apiJson({ error: 'Salão não encontrado.' }, { status: 404 })

    const items = await db
      .select({
        id: appointments.id,
        salonId: appointments.salonId,
        clientName: appointments.clientName,
        clientPhone: appointments.clientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        service: {
          id: services.id,
          name: services.name,
          price: services.price,
          duration: services.duration,
        },
      })
      .from(appointments)
      .leftJoin(services, eq(services.id, appointments.serviceId))
      .where(eq(appointments.salonId, salon.id))
      .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime))

    return apiJson({ salon: { id: salon.id, code: salon.salonCode, name: salon.name }, appointments: items })
  } catch (error) {
    console.error('[v0] Erro ao consultar agenda pública:', error)
    return apiJson({ error: 'Não foi possível carregar os agendamentos.' }, { status: 500 })
  }
}
