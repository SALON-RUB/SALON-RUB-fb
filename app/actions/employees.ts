'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons, employees } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  return session.user.id
}

async function getSalonByUserId(userId: string) {
  const salon = await db.query.salons.findFirst({
    where: eq(salons.ownerId, userId),
  })
  if (!salon) throw new Error('Salão não encontrado')
  return salon
}

export async function addEmployee(employeeData: {
  name: string
  email: string
  phone?: string
  role: 'employee' | 'owner'
}) {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  const newEmployee = await db
    .insert(employees)
    .values({
      salonId: salon.id,
      userId: `employee_${Date.now()}`,
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      role: employeeData.role,
    })
    .returning()

  revalidatePath('/dashboard/funcionarios')
  return newEmployee[0]
}

export async function getEmployees() {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  return db.query.employees.findMany({
    where: eq(employees.salonId, salon.id),
  })
}

export async function updateEmployee(
  employeeId: string,
  employeeData: {
    name: string
    email: string
    phone?: string
    role: 'employee' | 'owner'
  }
) {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  const updated = await db
    .update(employees)
    .set({
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      role: employeeData.role,
      updatedAt: new Date(),
    })
    .where(
      eq(employees.salonId, salon.id) && eq(employees.id, employeeId as any)
    )
    .returning()

  revalidatePath('/dashboard/funcionarios')
  return updated[0]
}

export async function deleteEmployee(employeeId: string) {
  const userId = await getUserId()
  const salon = await getSalonByUserId(userId)

  await db
    .delete(employees)
    .where(
      eq(employees.salonId, salon.id) && eq(employees.id, employeeId as any)
    )

  revalidatePath('/dashboard/funcionarios')
}
