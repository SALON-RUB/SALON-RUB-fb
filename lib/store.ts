import type { Salon, Employee, Service, Client, Appointment, Transaction, BusinessHours } from './types'

const STORAGE_KEYS = {
  SALONS: 'salao_pro_salons',
  EMPLOYEES: 'salao_pro_employees',
  SERVICES: 'salao_pro_services',
  CLIENTS: 'salao_pro_clients',
  APPOINTMENTS: 'salao_pro_appointments',
  TRANSACTIONS: 'salao_pro_transactions',
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function generateSalonCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function getStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function setStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// Salon Operations
export function getAllSalons(): Salon[] {
  return getStorage<Salon>(STORAGE_KEYS.SALONS)
}

export function getSalonById(id: string): Salon | undefined {
  return getAllSalons().find(s => s.id === id)
}

export function getSalonByCode(code: string): Salon | undefined {
  return getAllSalons().find(s => s.code.toUpperCase() === code.toUpperCase())
}

export function getSalonByOwnerEmail(email: string): Salon | undefined {
  return getAllSalons().find(s => s.ownerEmail.toLowerCase() === email.toLowerCase())
}

export function createSalon(data: {
  name: string
  phone: string
  address: string
  ownerName: string
  ownerEmail: string
  ownerPassword: string
}): Salon {
  const salons = getAllSalons()
  
  let code = generateSalonCode()
  while (salons.some(s => s.code === code)) {
    code = generateSalonCode()
  }

  const defaultBusinessHours: BusinessHours = {
    monday: { open: true, start: '09:00', end: '18:00' },
    tuesday: { open: true, start: '09:00', end: '18:00' },
    wednesday: { open: true, start: '09:00', end: '18:00' },
    thursday: { open: true, start: '09:00', end: '18:00' },
    friday: { open: true, start: '09:00', end: '18:00' },
    saturday: { open: true, start: '09:00', end: '14:00' },
    sunday: { open: false, start: '09:00', end: '18:00' },
  }

  const salon: Salon = {
    id: generateId(),
    code,
    name: data.name,
    phone: data.phone,
    address: data.address,
    ownerId: generateId(),
    ownerName: data.ownerName,
    ownerEmail: data.ownerEmail,
    ownerPassword: data.ownerPassword,
    createdAt: new Date().toISOString(),
    businessHours: defaultBusinessHours,
  }

  salons.push(salon)
  setStorage(STORAGE_KEYS.SALONS, salons)
  return salon
}

export function updateSalon(id: string, data: Partial<Salon>): Salon | undefined {
  const salons = getAllSalons()
  const index = salons.findIndex(s => s.id === id)
  if (index === -1) return undefined

  salons[index] = { ...salons[index], ...data }
  setStorage(STORAGE_KEYS.SALONS, salons)
  return salons[index]
}

// Employee Operations
export function getEmployeesBySalonId(salonId: string): Employee[] {
  return getStorage<Employee>(STORAGE_KEYS.EMPLOYEES).filter(e => e.salonId === salonId)
}

export function getEmployeeByEmail(email: string): Employee | undefined {
  return getStorage<Employee>(STORAGE_KEYS.EMPLOYEES).find(e => e.email.toLowerCase() === email.toLowerCase())
}

export function getEmployeeById(id: string): Employee | undefined {
  return getStorage<Employee>(STORAGE_KEYS.EMPLOYEES).find(e => e.id === id)
}

export function createEmployee(data: {
  salonId: string
  name: string
  email: string
  password: string
  phone: string
}): Employee {
  const employees = getStorage<Employee>(STORAGE_KEYS.EMPLOYEES)
  
  const employee: Employee = {
    id: generateId(),
    salonId: data.salonId,
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: 'employee',
    active: true,
    createdAt: new Date().toISOString(),
  }

  employees.push(employee)
  setStorage(STORAGE_KEYS.EMPLOYEES, employees)
  return employee
}

export function updateEmployee(id: string, data: Partial<Employee>): Employee | undefined {
  const employees = getStorage<Employee>(STORAGE_KEYS.EMPLOYEES)
  const index = employees.findIndex(e => e.id === id)
  if (index === -1) return undefined

  employees[index] = { ...employees[index], ...data }
  setStorage(STORAGE_KEYS.EMPLOYEES, employees)
  return employees[index]
}

export function deleteEmployee(id: string): boolean {
  const employees = getStorage<Employee>(STORAGE_KEYS.EMPLOYEES)
  const filtered = employees.filter(e => e.id !== id)
  setStorage(STORAGE_KEYS.EMPLOYEES, filtered)
  return filtered.length < employees.length
}

// Service Operations
export function getServicesBySalonId(salonId: string): Service[] {
  return getStorage<Service>(STORAGE_KEYS.SERVICES).filter(s => s.salonId === salonId)
}

export function getServiceById(id: string): Service | undefined {
  return getStorage<Service>(STORAGE_KEYS.SERVICES).find(s => s.id === id)
}

export function createService(data: {
  salonId: string
  name: string
  category: string
  duration: number
  price: number
}): Service {
  const services = getStorage<Service>(STORAGE_KEYS.SERVICES)
  
  const service: Service = {
    id: generateId(),
    salonId: data.salonId,
    name: data.name,
    category: data.category,
    duration: data.duration,
    price: data.price,
    active: true,
    createdAt: new Date().toISOString(),
  }

  services.push(service)
  setStorage(STORAGE_KEYS.SERVICES, services)
  return service
}

export function updateService(id: string, data: Partial<Service>): Service | undefined {
  const services = getStorage<Service>(STORAGE_KEYS.SERVICES)
  const index = services.findIndex(s => s.id === id)
  if (index === -1) return undefined

  services[index] = { ...services[index], ...data }
  setStorage(STORAGE_KEYS.SERVICES, services)
  return services[index]
}

export function deleteService(id: string): boolean {
  const services = getStorage<Service>(STORAGE_KEYS.SERVICES)
  const filtered = services.filter(s => s.id !== id)
  setStorage(STORAGE_KEYS.SERVICES, filtered)
  return filtered.length < services.length
}

// Client Operations
export function getClientsBySalonId(salonId: string): Client[] {
  return getStorage<Client>(STORAGE_KEYS.CLIENTS).filter(c => c.salonId === salonId)
}

export function getClientById(id: string): Client | undefined {
  return getStorage<Client>(STORAGE_KEYS.CLIENTS).find(c => c.id === id)
}

export function getOrCreateClient(salonId: string, name: string, phone: string): Client {
  const clients = getStorage<Client>(STORAGE_KEYS.CLIENTS)
  let client = clients.find(c => c.salonId === salonId && c.phone === phone)
  
  if (!client) {
    client = {
      id: generateId(),
      salonId,
      name,
      phone,
      createdAt: new Date().toISOString(),
    }
    clients.push(client)
    setStorage(STORAGE_KEYS.CLIENTS, clients)
  } else if (client.name !== name) {
    client.name = name
    setStorage(STORAGE_KEYS.CLIENTS, clients)
  }
  
  return client
}

// Appointment Operations
export function getAppointmentsBySalonId(salonId: string): Appointment[] {
  return getStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS).filter(a => a.salonId === salonId)
}

export function getAppointmentById(id: string): Appointment | undefined {
  return getStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS).find(a => a.id === id)
}

export function getAppointmentsByDate(salonId: string, date: string): Appointment[] {
  return getAppointmentsBySalonId(salonId).filter(a => a.date === date)
}

export function getAppointmentsByEmployee(salonId: string, employeeId: string): Appointment[] {
  return getAppointmentsBySalonId(salonId).filter(a => a.employeeId === employeeId)
}

export function createAppointment(data: {
  salonId: string
  clientId: string
  clientName: string
  clientPhone: string
  serviceId: string
  serviceName: string
  servicePrice: number
  employeeId?: string | null
  employeeName?: string | null
  date: string
  time: string
}): Appointment {
  const appointments = getStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS)
  
  const appointment: Appointment = {
    id: generateId(),
    salonId: data.salonId,
    clientId: data.clientId,
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    servicePrice: data.servicePrice,
    employeeId: data.employeeId || null,
    employeeName: data.employeeName || null,
    date: data.date,
    time: data.time,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  appointments.push(appointment)
  setStorage(STORAGE_KEYS.APPOINTMENTS, appointments)
  return appointment
}

export function updateAppointment(id: string, data: Partial<Appointment>): Appointment | undefined {
  const appointments = getStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS)
  const index = appointments.findIndex(a => a.id === id)
  if (index === -1) return undefined

  appointments[index] = { ...appointments[index], ...data }
  setStorage(STORAGE_KEYS.APPOINTMENTS, appointments)
  return appointments[index]
}

export function deleteAppointment(id: string): boolean {
  const appointments = getStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS)
  const filtered = appointments.filter(a => a.id !== id)
  setStorage(STORAGE_KEYS.APPOINTMENTS, filtered)
  return filtered.length < appointments.length
}

// Transaction Operations
export function getTransactionsBySalonId(salonId: string): Transaction[] {
  return getStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS).filter(t => t.salonId === salonId)
}

export function createTransaction(data: {
  salonId: string
  appointmentId?: string | null
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  employeeId?: string | null
  employeeName?: string | null
}): Transaction {
  const transactions = getStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS)
  
  const transaction: Transaction = {
    id: generateId(),
    salonId: data.salonId,
    appointmentId: data.appointmentId || null,
    type: data.type,
    category: data.category,
    description: data.description,
    amount: data.amount,
    date: data.date,
    employeeId: data.employeeId || null,
    employeeName: data.employeeName || null,
    createdAt: new Date().toISOString(),
  }

  transactions.push(transaction)
  setStorage(STORAGE_KEYS.TRANSACTIONS, transactions)
  return transaction
}

export function deleteTransaction(id: string): boolean {
  const transactions = getStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS)
  const filtered = transactions.filter(t => t.id !== id)
  setStorage(STORAGE_KEYS.TRANSACTIONS, filtered)
  return filtered.length < transactions.length
}

// Utility Functions
export function isTimeSlotAvailable(
  salonId: string,
  date: string,
  time: string,
  employeeId?: string | null
): boolean {
  const appointments = getAppointmentsByDate(salonId, date)
  return !appointments.some(a => {
    if (a.status === 'cancelled') return false
    if (a.time !== time) return false
    if (employeeId && a.employeeId !== employeeId) return false
    return true
  })
}

export function getAvailableTimeSlots(
  salon: Salon,
  date: string,
  employeeId?: string | null
): string[] {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof BusinessHours
  const hours = salon.businessHours[dayOfWeek]
  
  if (!hours.open) return []

  const slots: string[] = []
  const [startHour, startMin] = hours.start.split(':').map(Number)
  const [endHour, endMin] = hours.end.split(':').map(Number)
  
  let currentHour = startHour
  let currentMin = startMin

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const time = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
    if (isTimeSlotAvailable(salon.id, date, time, employeeId)) {
      slots.push(time)
    }
    currentMin += 30
    if (currentMin >= 60) {
      currentMin = 0
      currentHour++
    }
  }

  return slots
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}
