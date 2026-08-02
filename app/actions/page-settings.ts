'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons, salonPageSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getSalonIdByUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')

  const salon = await db.query.salons.findFirst({
    where: eq(salons.ownerId, session.user.id),
  })
  if (!salon) throw new Error('Salão não encontrado')
  return salon.id
}

export async function getPageSettings() {
  try {
    const salonId = await getSalonIdByUser()

    let settings = await db.query.salonPageSettings.findFirst({
      where: eq(salonPageSettings.salonId, salonId),
    })

    if (!settings) {
      // Criar configurações padrão se não existirem
      const [newSettings] = await db
        .insert(salonPageSettings)
        .values({
          salonId,
          pageName: 'Agende seu Horário',
          primaryColor: '#9333ea',
          secondaryColor: '#ffffff',
          backgroundColor: '#000000',
          textColor: '#ffffff',
          showLoyalty: true,
          loyaltyPointsPerPurchase: '1',
          buttonText: 'Agendar',
        })
        .returning()

      settings = newSettings
    }

    return settings
  } catch (error) {
    console.error('[v0] Erro ao buscar configurações da página:', error)
    throw error
  }
}

export async function updatePageSettings(data: {
  pageName?: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  showLoyalty?: boolean
  loyaltyPointsPerPurchase?: string
  loyaltyMessage?: string
  welcomeMessage?: string
  buttonText?: string
}) {
  try {
    const salonId = await getSalonIdByUser()

    const updated = await db
      .update(salonPageSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(salonPageSettings.salonId, salonId))
      .returning()

    revalidatePath('/dashboard/configuracoes-pagina')
    return updated[0]
  } catch (error) {
    console.error('[v0] Erro ao atualizar configurações da página:', error)
    throw error
  }
}

export async function getPageSettingsByCode(salonCode: string) {
  try {
    const salon = await db.query.salons.findFirst({
      where: eq(salons.salonCode, salonCode.toUpperCase()),
    })
    if (!salon) throw new Error('Código do salão não encontrado')

    let settings = await db.query.salonPageSettings.findFirst({
      where: eq(salonPageSettings.salonId, salon.id),
    })

    if (!settings) {
      // Retornar configurações padrão
      settings = {
        id: salon.id,
        salonId: salon.id,
        pageName: 'Agende seu Horário',
        logoUrl: null,
        primaryColor: '#9333ea',
        secondaryColor: '#ffffff',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        showLoyalty: true,
        loyaltyPointsPerPurchase: '1',
        loyaltyMessage: null,
        welcomeMessage: null,
        buttonText: 'Agendar',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any
    }

    return settings
  } catch (error) {
    console.error('[v0] Erro ao buscar configurações da página:', error)
    throw error
  }
}
