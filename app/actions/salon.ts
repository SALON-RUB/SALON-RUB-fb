
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salon, employee, service, appointment, operatingHours, expense } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Generate unique 6-character code
function generateSalonCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createSalon(data: {
  name: string
  phone: string
  address: string
}) {
  const userId = await getUserId()
  
  const newSalon = await db
    .insert(salon)
    .values({
      userId,
      name: data.name,
      phone: data.phone,
      address: data.address,
      code: generateSalonCode(),
    })
    .returning()

  revalidatePath('/')
  return newSalon[0]
}

export async function getSalonByUserId() {
  const userId = await getUserId()
  
  const result = await db
    .select()
    .from(salon)
    .where(eq(salon.userId, userId))
    .limit(1)

  return result[0] || null
}

export async function getSalonByCode(code: string) {
  const result = await db
    .select()
    .from(salon)
    .where(eq(salon.code, code))
    .limit(1)

  return result[0] || null
}

export async function addEmployee(salonId: string, data: {
  name: string
  email: string
  password: string
}) {
  const result = await db
    .insert(employee)
    .values({
      salonId,
      name: data.name,
      email: data.email,
      password: data.password,
    })
    .returning()

  revalidatePath('/dashboard')
  return result[0]
}

export async function getEmployeesBySalon(salonId: string) {
  return db
    .select()
    .from(employee)
    .where(eq(employee.salonId, salonId))
}

export async function addService(salonId: string, data: {
  name: string
  category: string
  price: string
  duration: number
}) {
  const result = await db
    .insert(service)
    .values({
      salonId,
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
    })
    .returning()

  revalidatePath('/dashboard')
  return result[0]
}

export async function getServicesBySalon(salonId: string) {
  return db
    .select()
    .from(service)
    .where(and(eq(service.salonId, salonId), eq(service.active, true)))
}

export async function createAppointment(salonId: string, data: any) {
  const result = await db
    .insert(appointment)
    .values({
      salonId,
      employeeId: data.employeeId || null,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      serviceId: data.serviceId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      revenue: data.revenue,
    })
    .returning()

  revalidatePath('/dashboard/agenda')
  return result[0]
}

export async function getAppointmentsBySalon(salonId: string, startDate?: Date, endDate?: Date) {
  let query = db
    .select()
    .from(appointment)
    .where(eq(appointment.salonId, salonId))

  if (startDate && endDate) {
    query = db
      .select()
      .from(appointment)
      .where(
        and(
          eq(appointment.salonId, salonId),
          gte(appointment.date, startDate),
          lte(appointment.date, endDate)
        )
      )
  }

  return query
}

export async function updateOperatingHours(salonId: string, hours: any) {
  for (let i = 0; i < 7; i++) {
    const existing = await db
      .select()
      .from(operatingHours)
      .where(and(eq(operatingHours.salonId, salonId), eq(operatingHours.dayOfWeek, i)))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(operatingHours)
        .set(hours[i])
        .where(eq(operatingHours.id, existing[0].id))
    } else {
      await db.insert(operatingHours).values({
        salonId,
        dayOfWeek: i,
        ...hours[i],
      })
    }
  }

  revalidatePath('/dashboard/configuracoes')
}

export async function getOperatingHours(salonId: string) {
  return db
    .select()
    .from(operatingHours)
    .where(eq(operatingHours.salonId, salonId))
}

export async function addExpense(salonId: string, data: {
  description: string
  amount: string
}) {
  const result = await db
    .insert(expense)
    .values({
      salonId,
      description: data.description,
      amount: data.amount,
    })
    .returning()

  revalidatePath('/dashboard/financeiro')
  return result[0]
}

export async function getExpensesBySalon(salonId: string) {
  return db
    .select()
    .from(expense)
    .where(eq(expense.salonId, salonId))
}
