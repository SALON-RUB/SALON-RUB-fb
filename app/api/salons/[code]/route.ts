import { db } from '@/lib/db'
import { salons, services } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const salonCode = code.toUpperCase()

    const salon = await db.query.salons.findFirst({
      where: eq(salons.salonCode, salonCode),
    })

    if (!salon) {
      return NextResponse.json(
        { error: 'Salão não encontrado' },
        { status: 404 }
      )
    }

    const salonServices = await db.query.services.findMany({
      where: eq(services.salonId, salon.id),
    })

    return NextResponse.json({
      id: salon.id,
      salonCode: salon.salonCode,
      name: salon.name,
      phone: salon.phone,
      address: salon.address,
      services: salonServices,
    })
  } catch (error) {
    console.error('Erro ao buscar salão:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar informações do salão' },
      { status: 500 }
    )
  }
}
