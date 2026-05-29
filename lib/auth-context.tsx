'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthState, UserRole, Salon, Employee } from './types'
import { getSalonById, getSalonByOwnerEmail, getEmployeeByEmail, getSalonByCode } from './store'

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: 'owner' | 'employee') => Promise<{ success: boolean; error?: string }>
  loginAsClient: (name: string, phone: string, salonCode: string) => Promise<{ success: boolean; error?: string; salonId?: string }>
  logout: () => void
  salon: Salon | null
  employee: Employee | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'salao_pro_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    salonId: null,
    userId: null,
    userName: null,
  })
  const [salon, setSalon] = useState<Salon | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as AuthState
      setAuthState(parsed)
      
      if (parsed.salonId) {
        const s = getSalonById(parsed.salonId)
        if (s) setSalon(s)
      }
      
      if (parsed.userRole === 'employee' && parsed.userId) {
        const employees = JSON.parse(localStorage.getItem('salao_pro_employees') || '[]')
        const emp = employees.find((e: Employee) => e.id === parsed.userId)
        if (emp) setEmployee(emp)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: 'owner' | 'employee') => {
    if (role === 'owner') {
      const s = getSalonByOwnerEmail(email)
      if (!s) {
        return { success: false, error: 'E-mail não encontrado' }
      }
      if (s.ownerPassword !== password) {
        return { success: false, error: 'Senha incorreta' }
      }

      const newState: AuthState = {
        isAuthenticated: true,
        userRole: 'owner',
        salonId: s.id,
        userId: s.ownerId,
        userName: s.ownerName,
      }
      
      setAuthState(newState)
      setSalon(s)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState))
      return { success: true }
    } else {
      const emp = getEmployeeByEmail(email)
      if (!emp) {
        return { success: false, error: 'E-mail não encontrado' }
      }
      if (emp.password !== password) {
        return { success: false, error: 'Senha incorreta' }
      }
      if (!emp.active) {
        return { success: false, error: 'Conta desativada' }
      }

      const s = getSalonById(emp.salonId)
      if (!s) {
        return { success: false, error: 'Salão não encontrado' }
      }

      const newState: AuthState = {
        isAuthenticated: true,
        userRole: 'employee',
        salonId: s.id,
        userId: emp.id,
        userName: emp.name,
      }

      setAuthState(newState)
      setSalon(s)
      setEmployee(emp)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState))
      return { success: true }
    }
  }

  const loginAsClient = async (name: string, phone: string, salonCode: string) => {
    const s = getSalonByCode(salonCode)
    if (!s) {
      return { success: false, error: 'Código do salão inválido' }
    }

    const newState: AuthState = {
      isAuthenticated: true,
      userRole: 'client',
      salonId: s.id,
      userId: phone,
      userName: name,
    }

    setAuthState(newState)
    setSalon(s)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState))
    return { success: true, salonId: s.id }
  }

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      salonId: null,
      userId: null,
      userName: null,
    })
    setSalon(null)
    setEmployee(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, loginAsClient, logout, salon, employee }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
