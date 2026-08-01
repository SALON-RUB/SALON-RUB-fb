'use server'

import crypto from 'crypto'

function getStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }
  return null
}

function setStorage(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value)
  }
}

export async function createAppointment(appointmentData: {
  salonCode: string
  clientName: string
  clientPhone: string
  serviceId: string
  appointmentDate: string
  appointmentTime: string
  notes?: string
}) {
  try {
    const appointments = JSON.parse(getStorage('appointments') || '[]')
    const services = JSON.parse(getStorage('services') || '[]')

    const service = services.find((s: any) => s.id === appointmentData.serviceId)

    const newAppointment = {
      id: crypto.randomUUID(),
      salonCode: appointmentData.salonCode,
      clientName: appointmentData.clientName,
      clientPhone: appointmentData.clientPhone,
      serviceId: appointmentData.serviceId,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      duration: service?.duration || 30,
      price: service?.price || '0',
      notes: appointmentData.notes || '',
      status: 'agendado',
      createdAt: new Date().toISOString(),
    }

    appointments.push(newAppointment)
    setStorage('appointments', JSON.stringify(appointments))

    return newAppointment
  } catch (error) {
    console.error('[v0] Erro ao criar agendamento:', error)
    throw error
  }
}

export async function getAppointmentsBySalon() {
  try {
    const userSession = getStorage('user_session')
    if (!userSession) return []

    const userData = JSON.parse(userSession)
    const appointments = JSON.parse(getStorage('appointments') || '[]')

    // Se for owner, retornar todos do salão
    if (userData.role === 'owner') {
      return appointments.filter((apt: any) => apt.salonCode === userData.salonCode)
    }

    // Se for employee, retornar apenas os seus
    return appointments.filter((apt: any) => apt.employeeId === userData.userId)
  } catch (error) {
    console.error('[v0] Erro ao buscar agendamentos:', error)
    return []
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string
) {
  try {
    const appointments = JSON.parse(getStorage('appointments') || '[]')
    const index = appointments.findIndex((apt: any) => apt.id === appointmentId)

    if (index >= 0) {
      appointments[index] = {
        ...appointments[index],
        status,
        updatedAt: new Date().toISOString(),
      }
      setStorage('appointments', JSON.stringify(appointments))
      return appointments[index]
    }

    throw new Error('Agendamento não encontrado')
  } catch (error) {
    console.error('[v0] Erro ao atualizar agendamento:', error)
    throw error
  }
}

export async function cancelAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, 'cancelado')
}

export async function completeAppointment(appointmentId: string) {
  return updateAppointmentStatus(appointmentId, 'concluido')
}
