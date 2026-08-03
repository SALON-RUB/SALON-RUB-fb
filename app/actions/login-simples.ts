'use server'

import { db } from '@/lib/db'
import { user, salons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function registerSalon(data: {
  nome: string
  nomeSalao: string
  email: string
  senha: string
}) {
  try {
    console.log('[v0] Iniciando registro:', data.email)

    // Verificar se email já existe
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, data.email))

    if (existingUser.length > 0) {
      return { success: false, error: 'Email já cadastrado' }
    }

    // Criar usuário
    const userId = `owner_${Date.now()}`
    const senhaHash = hashPassword(data.senha)

    const newUser = await db
      .insert(user)
      .values({
        id: userId,
        name: data.nome,
        email: data.email,
        password: senhaHash,
        emailVerified: false,
        image: null,
      })
      .returning()

    console.log('[v0] Usuário criado')

    if (!newUser || newUser.length === 0) {
      return { success: false, error: 'Erro ao criar usuário' }
    }

    // Criar salão
    const salonCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const newSalon = await db
      .insert(salons)
      .values({
        ownerId: userId,
        name: data.nomeSalao,
        salonCode: salonCode,
      })
      .returning()

    console.log('[v0] Salão criado:', salonCode)

    if (!newSalon || newSalon.length === 0) {
      return { success: false, error: 'Erro ao criar salão' }
    }

    return {
      success: true,
      userId: userId,
      salonCode: salonCode,
      nomeSalao: data.nomeSalao,
      email: data.email,
      nome: data.nome,
    }
  } catch (error) {
    console.error('[v0] Erro no registro:', error)
    return { success: false, error: (error as any).message || 'Erro ao registrar' }
  }
}

export async function loginSalon(email: string, senha: string) {
  try {
    console.log('[v0] Tentando login:', email)

    const senhaHash = hashPassword(senha)

    const foundUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))

    if (foundUser.length === 0) {
      return { success: false, error: 'Email não encontrado' }
    }

    const userData = foundUser[0]

    if (userData.password !== senhaHash) {
      return { success: false, error: 'Senha incorreta' }
    }

    // Buscar salão do usuário
    const salon = await db
      .select()
      .from(salons)
      .where(eq(salons.ownerId, userData.id))

    if (salon.length === 0) {
      return { success: false, error: 'Salão não encontrado' }
    }

    console.log('[v0] Login realizado com sucesso')

    return {
      success: true,
      userId: userData.id,
      email: userData.email,
      nome: userData.name,
      salonCode: salon[0].salonCode,
      nomeSalao: salon[0].name,
    }
  } catch (error) {
    console.error('[v0] Erro no login:', error)
    return { success: false, error: (error as any).message || 'Erro ao fazer login' }
  }
}
