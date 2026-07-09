
'use server'

import { db } from '@/lib/db'
import { salons, services, appointments, employees } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

// Para simplificar, vamos usar um sistema de autenticação baseado em localStorage
// mas com verificação no banco de dados

export async function createSalonIfNotExists(userId: string, name: string = 'Meu Salão') {
  try {
    // Verificar se já existe
    const existing = await db.query.salons.findFirst({
      where: eq(salons.ownerId, userId),
    })

    if (existing) return existing

    // Gerar código único
    const salonCode = crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()
      .slice(0, 7)

    const newSalon = await db
      .insert(salons)
      .values({
        ownerId: userId,
        name,
        salonCode,
      })
      .returning()

    return newSalon[0]
  } catch (error) {
    console.error('[v0] Erro ao criar salão:', error)
    return null
  }
}

export async function getSalonByCode(code: string) {
  try {
    const salon = await db.query.salons.findFirst({
      where: eq(salons.salonCode, code),
    })
    return salon
  } catch (error) {
    console.error('[v0] Erro ao buscar salão:', error)
    return null
  }
}

export async function getSalonById(salonId: string) {
  try {
    const salon = await db.query.salons.findFirst({
      where: eq(salons.id, salonId as any),
    })
    return salon
  } catch (error) {
    console.error('[v0] Erro ao buscar salão:', error)
    return null
  }
}

export async function addService(salonId: string, serviceData: {
  name: string
  category: string
  duration: number
  price: string
}) {
  try {
    const newService = await db
      .insert(services)
      .values({
        salonId: salonId as any,
        name: serviceData.name,
        category: serviceData.category,
        duration: serviceData.duration,
        price: serviceData.price,
      })
      .returning()

    revalidatePath('/dashboard/servicos')
    revalidatePath('/cliente')
    return newService[0]
  } catch (error) {
    console.error('[v0] Erro ao criar serviço:', error)
    throw error
  }
}

export async function getServicesBySalon(salonId: string) {
  try {
    // Buscar do banco de dados
    const dbServices = await db.query.services.findMany({
      where: eq(services.salonId, salonId as any),
    })
    
    return dbServices
  } catch (error) {
    console.error('[v0] Erro ao buscar serviços:', error)
    return []
  }
}

export async function updateService(
  serviceId: string,
  salonId: string,
  serviceData: {
    name: string
    category: string
    duration: number
    price: string
  }
) {
  try {
    const updated = await db
      .update(services)
      .set({
        name: serviceData.name,
        category: serviceData.category,
        duration: serviceData.duration,
        price: serviceData.price,
        updatedAt: new Date(),
      })
      .where(and(
        eq(services.id, serviceId as any),
        eq(services.salonId, salonId as any)
      ))
      .returning()

    revalidatePath('/dashboard/servicos')
    return updated[0]
  } catch (error) {
    console.error('[v0] Erro ao atualizar serviço:', error)
    throw error
  }
}

export async function deleteService(serviceId: string, salonId: string) {
  try {
    await db
      .delete(services)
      .where(and(
        eq(services.id, serviceId as any),
        eq(services.salonId, salonId as any)
      ))

    revalidatePath('/dashboard/servicos')
  } catch (error) {
    console.error('[v0] Erro ao deletar serviço:', error)
    throw error
  }
}

export async function createAppointment(salonId: string, appointmentData: {
  clientName: string
  clientPhone: string
  serviceId?: string
  appointmentDate: string
  appointmentTime: string
  price?: string
  notes?: string
}) {
  try {
    const newAppointment = await db
      .insert(appointments)
      .values({
        salonId: salonId as any,
        serviceId: appointmentData.serviceId as any,
        clientName: appointmentData.clientName,
        clientPhone: appointmentData.clientPhone,
        appointmentDate: appointmentData.appointmentDate as any,
        appointmentTime: appointmentData.appointmentTime,
        price: appointmentData.price,
        notes: appointmentData.notes,
      })
      .returning()

    revalidatePath('/dashboard/agendamentos')
    return newAppointment[0]
  } catch (error) {
    console.error('[v0] Erro ao criar agendamento:', error)
    throw error
  }
}

export async function getAppointmentsBySalon(salonId: string) {
  try {
    return await db.query.appointments.findMany({
      where: eq(appointments.salonId, salonId as any),
    })
  } catch (error) {
    console.error('[v0] Erro ao buscar agendamentos:', error)
    return []
  }
}

export async function addEmployee(salonId: string, employeeData: {
  name: string
  email: string
  userId: string
  phone?: string
}) {
  try {
    const newEmployee = await db
      .insert(employees)
      .values({
        salonId: salonId as any,
        name: employeeData.name,
        email: employeeData.email,
        userId: employeeData.userId,
        phone: employeeData.phone,
        role: 'employee',
      })
      .returning()

    revalidatePath('/dashboard/funcionarios')
    return newEmployee[0]
  } catch (error) {
    console.error('[v0] Erro ao criar funcionário:', error)
    throw error
  }
}

export async function getEmployeesBySalon(salonId: string) {
  try {
    return await db.query.employees.findMany({
      where: eq(employees.salonId, salonId as any),
    })
  } catch (error) {
    console.error('[v0] Erro ao buscar funcionários:', error)
    return []
  }
}

export async function deleteEmployee(employeeId: string, salonId: string) {
  try {
    await db
      .delete(employees)
      .where(and(
        eq(employees.id, employeeId as any),
        eq(employees.salonId, salonId as any)
      ))

    revalidatePath('/dashboard/funcionarios')
  } catch (error) {
    console.error('[v0] Erro ao deletar funcionário:', error)
    throw error
  }
}

