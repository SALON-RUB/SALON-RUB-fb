export interface Salon {
  id: string
  code: string
  name: string
  phone: string
  address: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  ownerPassword: string
  createdAt: string
  businessHours: BusinessHours
}

export interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: boolean
  start: string
  end: string
}

export interface Employee {
  id: string
  salonId: string
  name: string
  email: string
  password: string
  phone: string
  role: 'employee'
  active: boolean
  createdAt: string
}

export interface Service {
  id: string
  salonId: string
  name: string
  category: string
  duration: number
  price: number
  active: boolean
  createdAt: string
}

export interface Client {
  id: string
  salonId: string
  name: string
  phone: string
  createdAt: string
}

export interface Appointment {
  id: string
  salonId: string
  clientId: string
  clientName: string
  clientPhone: string
  serviceId: string
  serviceName: string
  servicePrice: number
  employeeId: string | null
  employeeName: string | null
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

export interface Transaction {
  id: string
  salonId: string
  appointmentId: string | null
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  employeeId: string | null
  employeeName: string | null
  createdAt: string
}

export type UserRole = 'owner' | 'employee' | 'client'

export interface AuthState {
  isAuthenticated: boolean
  userRole: UserRole | null
  salonId: string | null
  userId: string | null
  userName: string | null
}
