import { db } from '@/lib/db'
import { businessHours, salons, services } from '@/lib/db/schema'
import { apiJson, normalizeCode } from '@/lib/public-api'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

export async function OPTIONS() { return apiJson({ ok: true }) }

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const salon = await db.query.salons.findFirst({ where: eq(salons.salonCode, normalizeCode((await params).code)) })
    if (!salon) return apiJson({ error: 'Salão não encontrado.' }, { status: 404 })
    if (!salon.isActive) return apiJson({ error: 'Este salão está temporariamente indisponível.' }, { status: 403 })
    const [salonServices, hours] = await Promise.all([
      db.query.services.findMany({ where: eq(services.salonId, salon.id) }),
      db.query.businessHours.findMany({ where: eq(businessHours.salonId, salon.id) }),
    ])
    const serviceImages = ((salon.settings || {}) as Record<string, unknown>).serviceImages as Record<string, string> | undefined
    return apiJson({ salon: { id: salon.id, code: salon.salonCode, name: salon.name, phone: salon.phone, address: salon.address, settings: salon.settings }, services: salonServices.map((service) => ({ ...service, imageUrl: serviceImages?.[service.id] || '' })), businessHours: hours })
  } catch (error) {
    console.error('[v0] Erro na API pública do salão:', error)
    return apiJson({ error: 'Erro interno ao buscar o salão.' }, { status: 500 })
  }
}
