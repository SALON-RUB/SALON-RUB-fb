'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons, employees, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function getUserRole(userId: string, salonId: string) {
  const isOwner = await db.query.salons.findFirst({
    where: eq(salons.ownerId, userId) && eq(salons.id, salonId as any),
  })

  if (isOwner) return 'owner'

  const employee = await db.query.employees.findFirst({
    where: eq(employees.userId, userId) && eq(employees.salonId, salonId as any),
  })

  return employee?.role || null
}

export async function getCurrentSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session
}

export async function isOwner(salonId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const salon = await db.query.salons.findFirst({
    where: eq(salons.id, salonId as any),
  })

  return salon?.ownerId === session.user.id
}

export async function isEmployee(salonId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false

  const employee = await db.query.employees.findFirst({
    where: eq(employees.userId, session.user.id) && eq(employees.salonId, salonId as any),
  })

  return !!employee
}

export async function getUserSalon(userId: string) {
  const salon = await db.query.salons.findFirst({
    where: eq(salons.ownerId, userId),
  })
  return salon
}

export async function getEmployeeSalon(userId: string) {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.userId, userId),
  })

  if (!employee) return null

  const salon = await db.query.salons.findFirst({
    where: eq(salons.id, employee.salonId),
  })

  return salon
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export async function createOwnerAccount(data: {
  numero: string
  fullName: string
  nomeSalao: string
  email: string
  password: string
}) {
  try {
    console.log('[v0] Iniciando createOwnerAccount com email:', data.email)
    
    // Verificar se o email já existe
    const existingUsers = await db.select().from(user).where(eq(user.email, data.email))

    if (existingUsers.length > 0) {
      console.log('[v0] Email já existe')
      return { success: false, error: 'Email já cadastrado' }
    }

    // Criar usuário
    const userId = `owner_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const hashedPassword = hashPassword(data.password)

    console.log('[v0] Tentando inserir usuário com ID:', userId)
    const newUser = await db
      .insert(user)
      .values({
        id: userId,
        name: data.fullName,
        email: data.email,
        emailVerified: false,
        image: null,
        password: hashedPassword,
      })
      .returning()

    console.log('[v0] Usuário criado:', newUser)

    if (!newUser || newUser.length === 0) {
      console.log('[v0] Erro: newUser está vazio')
      return { success: false, error: 'Erro ao criar usuário' }
    }

    // Criar salão
    const salonId = crypto.randomUUID()
    const salonCode = Math.random().toString(36).slice(2, 8).toUpperCase()

    console.log('[v0] Tentando criar salão com ID:', salonId, 'Code:', salonCode)
    const newSalon = await db
      .insert(salons)
      .values({
        id: salonId as any,
        name: data.nomeSalao,
        ownerId: userId,
        salonCode: salonCode,
      })
      .returning()

    console.log('[v0] Salão criado:', newSalon)

    if (!newSalon || newSalon.length === 0) {
      console.log('[v0] Erro: newSalon está vazio')
      return { success: false, error: 'Erro ao criar salão' }
    }

    console.log('[v0] Conta criada com sucesso!')
    return {
      success: true,
      user: {
        id: userId,
        email: data.email,
        name: data.fullName,
      },
      salon: {
        id: salonId,
        name: data.nomeSalao,
        salonCode: salonCode,
      }
    }
  } catch (error) {
    console.error('[v0] Erro ao criar conta:', error)
    console.error('[v0] Erro message:', (error as any)?.message)
    console.error('[v0] Erro stack:', (error as any)?.stack)
    return { success: false, error: (error as any)?.message || 'Erro ao criar conta' }
  }
}

export async function loginOwner(email: string, password: string) {
  try {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    })

    if (!existingUser) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    if (!existingUser.password || !verifyPassword(password, existingUser.password)) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    // Buscar salão do dono
    const salon = await db.query.salons.findFirst({
      where: eq(salons.ownerId, existingUser.id),
    })

    if (!salon) {
      return { success: false, error: 'Salão não encontrado' }
    }

    return {
      success: true,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
      salon: {
        id: salon.id,
        name: salon.name,
        salonCode: salon.salonCode,
      }
    }
  } catch (error) {
    console.error('[v0] Erro ao fazer login:', error)
    return { success: false, error: 'Erro ao fazer login' }
  }
}

export async function createEmployeeAccount(data: {
  fullName: string
  email: string
  salonCode: string
}) {
  try {
    // Verificar se o email já existe
    const existingUsers = await db.select().from(user).where(eq(user.email, data.email))

    if (existingUsers.length > 0) {
      return { success: false, error: 'Email já cadastrado' }
    }

    // Buscar salão pelo código
    const salonList = await db.select().from(salons).where(eq(salons.salonCode, data.salonCode))

    if (salonList.length === 0) {
      return { success: false, error: 'Código do salão inválido' }
    }

    const salon = salonList[0]

    // Criar usuário
    const userId = `emp_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const tempPassword = Math.random().toString(36).slice(2, 10)
    const hashedPassword = hashPassword(tempPassword)

    await db
      .insert(user)
      .values({
        id: userId,
        name: data.fullName,
        email: data.email,
        emailVerified: false,
        image: null,
        password: hashedPassword,
      })
      .returning()

    // Criar funcionário
    const employeeId = crypto.randomUUID()
    await db
      .insert(employees)
      .values({
        id: employeeId,
        userId: userId,
        salonId: salon.id as any,
        name: data.fullName,
        email: data.email,
        role: 'employee',
      })
      .returning()

    return {
      success: true,
      user: {
        id: userId,
        email: data.email,
        name: data.fullName,
        tempPassword: tempPassword,
      },
      salon: {
        id: salon.id,
        name: salon.name,
        salonCode: salon.salonCode,
      }
    }
  } catch (error) {
    console.error('[v0] Erro ao criar conta de funcionário:', error)
    return { success: false, error: 'Erro ao criar conta' }
  }
}

export async function loginEmployee(email: string, password: string) {
  try {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    })

    if (!existingUser) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    if (!existingUser.password || !verifyPassword(password, existingUser.password)) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    // Buscar funcionário
    const employee = await db.query.employees.findFirst({
      where: eq(employees.userId, existingUser.id),
    })

    if (!employee) {
      return { success: false, error: 'Funcionário não encontrado' }
    }

    // Buscar salão
    const salon = await db.query.salons.findFirst({
      where: eq(salons.id, employee.salonId),
    })

    if (!salon) {
      return { success: false, error: 'Salão não encontrado' }
    }

    return {
      success: true,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
      salon: {
        id: salon.id,
        name: salon.name,
        salonCode: salon.salonCode,
      }
    }
  } catch (error) {
    console.error('[v0] Erro ao fazer login:', error)
    return { success: false, error: 'Erro ao fazer login' }
  }
}
