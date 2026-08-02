'use server'

import { db } from '@/lib/db'
import { salonPageSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getPageSettingsByUserId(userId: string) {
  try {
    const settings = await db
      .select()
      .from(salonPageSettings)
      .where(eq(salonPageSettings.salonId, userId as any))
      .limit(1)

    if (settings.length > 0) {
      return settings[0]
    }

    // Criar padrão se não existir
    const created = await db
      .insert(salonPageSettings)
      .values({
        salonId: userId as any,
        pageName: 'Agende seu Horário',
        primaryColor: '#9333ea',
        secondaryColor: '#ffffff',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        buttonText: 'Agendar',
      } as any)
      .returning()

    return created[0]
  } catch (error) {
    console.error('[v0] Erro ao buscar configurações:', error)
    return null
  }
}

export async function updatePageSettings(userId: string, updates: any) {
  try {
    const existing = await db
      .select()
      .from(salonPageSettings)
      .where(eq(salonPageSettings.salonId, userId as any))
      .limit(1)

    let result
    if (existing.length > 0) {
      result = await db
        .update(salonPageSettings)
        .set({
          pageName: updates.pageName || existing[0].pageName,
          logoUrl: updates.logoUrl || existing[0].logoUrl,
          primaryColor: updates.primaryColor || existing[0].primaryColor,
          secondaryColor: updates.secondaryColor || existing[0].secondaryColor,
          backgroundColor: updates.backgroundColor || existing[0].backgroundColor,
          textColor: updates.textColor || existing[0].textColor,
          welcomeMessage: updates.welcomeMessage || existing[0].welcomeMessage,
          buttonText: updates.buttonText || existing[0].buttonText,
          updatedAt: new Date(),
        } as any)
        .where(eq(salonPageSettings.salonId, userId as any))
        .returning()
    } else {
      result = await db
        .insert(salonPageSettings)
        .values({
          salonId: userId as any,
          pageName: updates.pageName || 'Agende seu Horário',
          logoUrl: updates.logoUrl,
          primaryColor: updates.primaryColor || '#9333ea',
          secondaryColor: updates.secondaryColor || '#ffffff',
          backgroundColor: updates.backgroundColor || '#000000',
          textColor: updates.textColor || '#ffffff',
          welcomeMessage: updates.welcomeMessage,
          buttonText: updates.buttonText || 'Agendar',
        } as any)
        .returning()
    }

    revalidatePath('/dashboard/configuracoes-pagina')
    return result[0]
  } catch (error) {
    console.error('[v0] Erro ao atualizar configurações:', error)
    throw error
  }
}
