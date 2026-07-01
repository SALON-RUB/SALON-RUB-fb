'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/toast'
import { Settings, Clock, Save } from 'lucide-react'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showToast, setShowToast] = useState(false)
  const [config, setConfig] = useState({
    nomeSalon: '',
    telefone: '',
    endereco: '',
    horarios: {
      segunda: { aberto: true, horarioInicio: '09:00', horarioFim: '18:00' },
      terca: { aberto: true, horarioInicio: '09:00', horarioFim: '18:00' },
      quarta: { aberto: true, horarioInicio: '09:00', horarioFim: '18:00' },
      quinta: { aberto: true, horarioInicio: '09:00', horarioFim: '18:00' },
      sexta: { aberto: true, horarioInicio: '09:00', horarioFim: '18:00' },
      sabado: { aberto: true, horarioInicio: '09:00', horarioFim: '18:00' },
      domingo: { aberto: false, horarioInicio: '09:00', horarioFim: '18:00' },
    },
  })
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const session = localStorage.getItem('salon_session')
    if (!session) {
      router.push('/sign-in')
      return
    }

    const sessionData = JSON.parse(session)
    setUser(sessionData)

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userData = users.find((u: any) => u.id === sessionData.userId)
    if (userData?.salon?.config) {
      setConfig(userData.salon.config)
    }
  }, [router])

  // Auto-save com debounce quando config muda
  useEffect(() => {
    if (!user) return

    // Limpar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Definir novo timer
    debounceTimerRef.current = setTimeout(() => {
      saveConfigToLocalStorage()
    }, 500) // Aguarda 500ms após mudança

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [config, user])

  const saveConfigToLocalStorage = useCallback(() => {
    if (!user) return
    
    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex].salon.config = config
      localStorage.setItem('salon_users', JSON.stringify(users))
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    }
  }, [user, config])

  const handleSaveConfig = () => {
    saveConfigToLocalStorage()
  }

  if (!user) return null

  const diasSemana = [
    { chave: 'segunda', label: 'Segunda-feira' },
    { chave: 'terca', label: 'Terça-feira' },
    { chave: 'quarta', label: 'Quarta-feira' },
    { chave: 'quinta', label: 'Quinta-feira' },
    { chave: 'sexta', label: 'Sexta-feira' },
    { chave: 'sabado', label: 'Sábado' },
    { chave: 'domingo', label: 'Domingo' },
  ]

  return (
    <DashboardLayout>
      <Toast
        message="Configurações salvas com sucesso!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize as informações do seu salão</p>
        </div>

        {/* Informações do Salão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Informações do Salão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Salão</label>
              <Input
                placeholder="Nome do seu salão"
                value={config.nomeSalon}
                onChange={(e) => setConfig({ ...config, nomeSalon: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <Input
                placeholder="(11) 99999-9999"
                value={config.telefone}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <Input
                placeholder="Endereço completo"
                value={config.endereco}
                onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {diasSemana.map((dia) => (
              <div key={dia.chave} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                <div className="w-40">
                  <p className="font-medium text-sm">{dia.label}</p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.horarios[dia.chave as keyof typeof config.horarios].aberto}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        horarios: {
                          ...config.horarios,
                          [dia.chave]: {
                            ...config.horarios[dia.chave as keyof typeof config.horarios],
                            aberto: e.target.checked,
                          },
                        },
                      })
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Aberto</span>
                </label>

                {config.horarios[dia.chave as keyof typeof config.horarios].aberto && (
                  <div className="flex gap-2 ml-auto">
                    <input
                      type="time"
                      value={config.horarios[dia.chave as keyof typeof config.horarios].horarioInicio}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          horarios: {
                            ...config.horarios,
                            [dia.chave]: {
                              ...config.horarios[dia.chave as keyof typeof config.horarios],
                              horarioInicio: e.target.value,
                            },
                          },
                        })
                      }}
                      className="px-3 py-1 border border-input rounded-md text-sm bg-background"
                    />
                    <span className="text-muted-foreground">até</span>
                    <input
                      type="time"
                      value={config.horarios[dia.chave as keyof typeof config.horarios].horarioFim}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          horarios: {
                            ...config.horarios,
                            [dia.chave]: {
                              ...config.horarios[dia.chave as keyof typeof config.horarios],
                              horarioFim: e.target.value,
                            },
                          },
                        })
                      }}
                      className="px-3 py-1 border border-input rounded-md text-sm bg-background"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex gap-2">
          <Button onClick={handleSaveConfig} className="gap-2">
            <Save size={16} />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
