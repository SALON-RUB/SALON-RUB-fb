'use server'

import { db } from '@/lib/db'
import { salons, salonPageSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// Função auxiliar para obter salonId do usuário via localStorage (necessário porque user vem do cliente)
async function getSalonIdByCode(salonCode: string) {
  try {
    const salon = await db
      .select()
      .from(salons)
      .where(eq(salons.salonCode, salonCode))

    if (salon.length === 0) throw new Error('Salão não encontrado')
    return salon[0].id
  } catch (error) {
    console.error('[v0] Erro ao buscar salão:', error)
    throw error
  }
}

export async function getPageSettingsBySalonCode(salonCode: string) {
  try {
    const salonId = await getSalonIdByCode(salonCode)

    const settings = await db
      .select()
      .from(salonPageSettings)
      .where(eq(salonPageSettings.salonId, salonId))

    if (settings.length > 0) {
      return settings[0]
    }

    // Criar configurações padrão se não existirem
    const defaultSettings = await db
      .insert(salonPageSettings)
      .values({
        salonId: salonId as any,
        pageName: 'Agende seu Horário',
        primaryColor: '#9333ea',
        secondaryColor: '#ffffff',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        buttonText: 'Agendar',
        showLoyalty: true,
        loyaltyPointsPerPurchase: '1',
      } as any)
      .returning()

    return defaultSettings[0]
  } catch (error) {
    console.error('[v0] Erro ao buscar configurações:', error)
    throw error
  }
}

export async function updatePageSettingsBySalonCode(
  salonCode: string,
  updates: {
    pageName?: string
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    textColor?: string
    buttonText?: string
    fontFamily?: string
    welcomeMessage?: string
    loyaltyMessage?: string
    showLoyalty?: boolean
    loyaltyPointsPerPurchase?: string
  }
) {
  try {
    const salonId = await getSalonIdByCode(salonCode)

    const updated = await db
      .update(salonPageSettings)
      .set({
        pageName: updates.pageName,
        logoUrl: updates.logoUrl,
        primaryColor: updates.primaryColor,
        secondaryColor: updates.secondaryColor,
        backgroundColor: updates.backgroundColor,
        textColor: updates.textColor,
        buttonText: updates.buttonText,
        welcomeMessage: updates.welcomeMessage,
        loyaltyMessage: updates.loyaltyMessage,
        showLoyalty: updates.showLoyalty,
        loyaltyPointsPerPurchase: updates.loyaltyPointsPerPurchase,
        updatedAt: new Date(),
      } as any)
      .where(eq(salonPageSettings.salonId, salonId as any))
      .returning()

    revalidatePath('/dashboard/configuracoes-pagina')
    revalidatePath('/cliente')

    return updated[0]
  } catch (error) {
    console.error('[v0] Erro ao atualizar configurações:', error)
    throw error
  }
}

export async function updatePageSettingsWithAI(
  salonCode: string,
  userRequest: string
) {
  try {
    const { generateText } = await import('ai')

    const currentSettings = await getPageSettingsBySalonCode(salonCode)

    const prompt = `Você é um assistente de design para salões de beleza. 
O usuário pediu: "${userRequest}"

Configurações atuais:
- Nome da página: ${currentSettings?.pageName}
- Cor primária: ${currentSettings?.primaryColor}
- Cor secundária: ${currentSettings?.secondaryColor}
- Cor de fundo: ${currentSettings?.backgroundColor}
- Cor do texto: ${currentSettings?.textColor}
- Botão: ${currentSettings?.buttonText}
- Logo URL: ${currentSettings?.logoUrl}
- Mensagem de boas-vindas: ${currentSettings?.welcomeMessage}

Baseado no pedido do usuário, retorne um JSON com as alterações a serem feitas. Retorne APENAS o JSON, sem explicações.
Formato esperado:
{
  "pageName": "novo nome",
  "primaryColor": "#XXXXXX",
  "secondaryColor": "#XXXXXX", 
  "backgroundColor": "#XXXXXX",
  "textColor": "#XXXXXX",
  "buttonText": "texto do botão",
  "welcomeMessage": "mensagem de boas-vindas",
  "logoUrl": "url da logo (manter null se não alterar)"
}

Dicas de cores boas para salões de beleza:
- Roxo/Pink para elegância
- Branco/Cinza para modernidade
- Preto para sofisticação`

    const response = await generateText({
      model: 'gpt-4o-mini',
      prompt: prompt,
      temperature: 0.7,
    })

    const jsonMatch = response.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Não foi possível gerar recomendações')
    }

    const suggestions = JSON.parse(jsonMatch[0])

    // Atualizar com as sugestões
    const updated = await updatePageSettingsBySalonCode(salonCode, suggestions)

    return {
      success: true,
      message: 'Alterações aplicadas com sucesso!',
      settings: updated,
    }
  } catch (error) {
    console.error('[v0] Erro ao usar IA:', error)
    throw error
  }
}
