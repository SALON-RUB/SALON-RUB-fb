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

export async function addEmployee(employeeData: {
  name: string
  email: string
  phone?: string
  role: 'employee' | 'owner'
}) {
  try {
    const employees = JSON.parse(getStorage('employee_accounts') || '[]')

    const newEmployee = {
      id: crypto.randomUUID(),
      userId: `employee_${Date.now()}`,
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone || '',
      role: employeeData.role,
      createdAt: new Date().toISOString(),
    }

    employees.push(newEmployee)
    setStorage('employee_accounts', JSON.stringify(employees))

    return newEmployee
  } catch (error) {
    console.error('[v0] Erro ao adicionar funcionário:', error)
    throw error
  }
}

export async function getEmployees() {
  try {
    const userSession = getStorage('user_session')
    if (!userSession) return []

    const userData = JSON.parse(userSession)
    const employees = JSON.parse(getStorage('employee_accounts') || '[]')

    // Se for owner, retornar todos os funcionários
    if (userData.role === 'owner') {
      return employees.filter((e: any) => e.salonCode === userData.salonCode)
    }

    return []
  } catch (error) {
    console.error('[v0] Erro ao buscar funcionários:', error)
    return []
  }
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
  try {
    const employees = JSON.parse(getStorage('employee_accounts') || '[]')
    const index = employees.findIndex((e: any) => e.id === employeeId)

    if (index >= 0) {
      employees[index] = {
        ...employees[index],
        ...employeeData,
        updatedAt: new Date().toISOString(),
      }
      setStorage('employee_accounts', JSON.stringify(employees))
      return employees[index]
    }

    throw new Error('Funcionário não encontrado')
  } catch (error) {
    console.error('[v0] Erro ao atualizar funcionário:', error)
    throw error
  }
}

export async function deleteEmployee(employeeId: string) {
  try {
    const employees = JSON.parse(getStorage('employee_accounts') || '[]')
    const filtered = employees.filter((e: any) => e.id !== employeeId)
    setStorage('employee_accounts', JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('[v0] Erro ao deletar funcionário:', error)
    throw error
  }
}
