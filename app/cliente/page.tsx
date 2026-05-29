'use client'

import { useEffect, useState } from 'react'
import { getSalonByCode, getServicesBySalonId, getEmployeesBySalonId, getAppointmentsBySalonId, createAppointment, getOrCreateClient, formatCurrency } from '@/lib/store'
import type { Salon, Service, Employee, Appointment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scissors, ArrowLeft, Check, Calendar, Clock, User, Phone, MapPin, ArrowRight } from 'lucide-react'

type Step = 'login' | 'services' | 'professional' | 'datetime' | 'confirm' | 'success'

export default function ClientePage() {
  const [step, setStep] = useState<Step>('login')
  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  
  // Form data
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [salonCode, setSalonCode] = useState('')
  const [error, setError] = useState('')
  
  // Selection
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const handleLogin = () => {
    if (!clientName.trim() || !clientPhone.trim() || !salonCode.trim()) {
      setError('Preencha todos os campos')
      return
    }

    const foundSalon = getSalonByCode(salonCode.toUpperCase())
    if (!foundSalon) {
      setError('Codigo do salao invalido')
      return
    }

    setSalon(foundSalon)
    setServices(getServicesBySalonId(foundSalon.id).filter(s => s.active))
    setEmployees(getEmployeesBySalonId(foundSalon.id).filter(e => e.active))
    setAppointments(getAppointmentsBySalonId(foundSalon.id))
    setError('')
    setStep('services')
  }

  const getAvailableSlots = () => {
    if (!salon || !selectedDate) return []
    
    const date = new Date(selectedDate + 'T12:00:00')
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof salon.businessHours
    const hours = salon.businessHours[dayOfWeek]
    
    if (!hours.isOpen) return []

    const slots: string[] = []
    const [startHour, startMin] = hours.open.split(':').map(Number)
    const [endHour, endMin] = hours.close.split(':').map(Number)
    
    let currentHour = startHour
    let currentMin = startMin

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
      
      const isBooked = appointments.some(a => 
        a.date === selectedDate && 
        a.time === timeStr && 
        a.status !== 'cancelled' &&
        (!selectedEmployee || a.employeeId === selectedEmployee.id || !a.employeeId)
      )
      
      if (!isBooked) {
        slots.push(timeStr)
      }

      currentMin += 30
      if (currentMin >= 60) {
        currentMin = 0
        currentHour++
      }
    }

    return slots
  }

  const handleConfirm = () => {
    if (!salon || !selectedService || !selectedDate || !selectedTime) return

    const client = getOrCreateClient(salon.id, clientName, clientPhone)

    createAppointment({
      salonId: salon.id,
      clientId: client.id,
      clientName,
      clientPhone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      employeeId: selectedEmployee?.id || null,
      employeeName: selectedEmployee?.name || null,
      date: selectedDate,
      time: selectedTime
    })

    setStep('success')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const getNextDays = () => {
    if (!salon) return []
    const days: { date: string; label: string; isOpen: boolean }[] = []
    const today = new Date()
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof salon.businessHours
      const isOpen = salon.businessHours[dayOfWeek].isOpen
      
      days.push({
        date: dateStr,
        label: i === 0 ? 'Hoje' : i === 1 ? 'Amanha' : date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
        isOpen
      })
    }
    
    return days
  }

  const availableSlots = getAvailableSlots()
  const nextDays = getNextDays()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {step !== 'login' && step !== 'success' ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (step === 'services') setStep('login')
                else if (step === 'professional') setStep('services')
                else if (step === 'datetime') setStep('professional')
                else if (step === 'confirm') setStep('datetime')
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-10" />
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">
              <span className="text-primary">Salao</span> Pro
            </span>
          </div>
          <div className="w-10" />
        </div>
        {salon && step !== 'login' && step !== 'success' && (
          <div className="px-4 pb-3 text-center">
            <p className="text-sm text-muted-foreground">{salon.name}</p>
          </div>
        )}
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* Login Step */}
        {step === 'login' && (
          <div className="space-y-6 pt-8">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-primary rounded-2xl mx-auto flex items-center justify-center">
                <Scissors className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">
                <span className="text-primary">Salao</span> <span className="text-foreground">Pro</span>
              </h1>
              <p className="text-muted-foreground">Agende seu horario</p>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Acesso do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="pl-10 bg-input border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="pl-10 bg-input border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Codigo do Salao</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={salonCode}
                      onChange={(e) => setSalonCode(e.target.value.toUpperCase())}
                      placeholder="Ex: ABC123"
                      className="pl-10 bg-input border-border text-foreground uppercase"
                      maxLength={6}
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button onClick={handleLogin} className="w-full">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services Step */}
        {step === 'services' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-foreground">Escolha o Servico</h2>
              <p className="text-sm text-muted-foreground">Ola, {clientName}</p>
            </div>

            {services.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum servico disponivel no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {services.map(service => (
                  <Card 
                    key={service.id} 
                    className={`bg-card border-border cursor-pointer transition-all ${
                      selectedService?.id === service.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.duration} min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(service.price)}</p>
                        {selectedService?.id === service.id && (
                          <Check className="h-5 w-5 text-primary ml-auto" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedService && (
              <Button onClick={() => setStep('professional')} className="w-full">
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Professional Step */}
        {step === 'professional' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-foreground">Escolha o Profissional</h2>
              <p className="text-sm text-muted-foreground">Opcional - deixe em branco para qualquer disponivel</p>
            </div>

            <Card 
              className={`bg-card border-border cursor-pointer transition-all ${
                !selectedEmployee ? 'ring-2 ring-primary' : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedEmployee(null)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Qualquer Disponivel</h3>
                  <p className="text-sm text-muted-foreground">Primeiro profissional livre</p>
                </div>
                {!selectedEmployee && <Check className="h-5 w-5 text-primary" />}
              </CardContent>
            </Card>

            {employees.map(employee => (
              <Card 
                key={employee.id} 
                className={`bg-card border-border cursor-pointer transition-all ${
                  selectedEmployee?.id === employee.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedEmployee(employee)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.role || 'Profissional'}</p>
                  </div>
                  {selectedEmployee?.id === employee.id && <Check className="h-5 w-5 text-primary" />}
                </CardContent>
              </Card>
            ))}

            <Button onClick={() => setStep('datetime')} className="w-full">
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Date/Time Step */}
        {step === 'datetime' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-foreground">Escolha a Data e Horario</h2>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {nextDays.slice(0, 8).map(day => (
                    <button
                      key={day.date}
                      disabled={!day.isOpen}
                      onClick={() => {
                        setSelectedDate(day.date)
                        setSelectedTime('')
                      }}
                      className={`p-2 rounded-lg text-center text-sm transition-all ${
                        !day.isOpen 
                          ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed' 
                          : selectedDate === day.date 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary text-foreground hover:bg-primary/20'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedDate && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availableSlots.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum horario disponivel nesta data
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`p-2 rounded-lg text-center text-sm transition-all ${
                            selectedTime === slot 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary text-foreground hover:bg-primary/20'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedDate && selectedTime && (
              <Button onClick={() => setStep('confirm')} className="w-full">
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && selectedService && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-foreground">Confirmar Agendamento</h2>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Servico</span>
                  <span className="font-medium text-foreground">{selectedService.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Profissional</span>
                  <span className="font-medium text-foreground">{selectedEmployee?.name || 'Qualquer disponivel'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium text-foreground">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Horario</span>
                  <span className="font-medium text-foreground">{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(selectedService.price)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm text-foreground">
                  <strong>Seus dados:</strong><br />
                  {clientName}<br />
                  {clientPhone}
                </p>
              </CardContent>
            </Card>

            <Button onClick={handleConfirm} className="w-full" size="lg">
              <Check className="mr-2 h-5 w-5" />
              Confirmar Agendamento
            </Button>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="space-y-6 pt-12 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Agendamento Confirmado!</h2>
              <p className="text-muted-foreground">
                Seu horario foi marcado com sucesso. Aguardamos voce!
              </p>
            </div>

            {selectedService && (
              <Card className="bg-card border-border text-left">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Servico</span>
                    <span className="font-medium text-foreground">{selectedService.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium text-foreground">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Horario</span>
                    <span className="font-medium text-foreground">{selectedTime}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              variant="outline" 
              onClick={() => {
                setStep('login')
                setSalon(null)
                setSelectedService(null)
                setSelectedEmployee(null)
                setSelectedDate('')
                setSelectedTime('')
                setClientName('')
                setClientPhone('')
                setSalonCode('')
              }}
              className="w-full"
            >
              Fazer Novo Agendamento
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
