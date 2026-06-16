'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { salons, employees, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

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
