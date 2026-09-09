import { db } from '@/lib/db'
import { appointments, salons } from '@/lib/db/schema'
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

    const items = await db.query.appointments.findMany({
      where: eq(appointments.salonId, salon.id),
      with: { service: true },
      orderBy: [desc(appointments.appointmentDate), desc(appointments.appointmentTime)],
    })
    return apiJson({ salon: { id: salon.id, code: salon.salonCode, name: salon.name }, appointments: items })
  } catch (error) {
    console.error('[v0] Erro ao consultar agenda pública:', error)
    return apiJson({ error: 'Não foi possível carregar os agendamentos.' }, { status: 500 })
  }
}
