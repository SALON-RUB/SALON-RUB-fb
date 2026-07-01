'use client'

import { useState, useEffect, useTransition } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast } from '@/components/toast'
import { Scissors, Plus, X, Edit2, Trash2 } from 'lucide-react'
import { addService, getServicesBySalon, updateService, deleteService } from '@/app/actions/salon'

export default function ServicosPage() {
  const [isPending, startTransition] = useTransition()
  const [services, setServices] = useState<any[]>([])
  const [salonId, setSalonId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [formData, setFormData] = useState({
    name: '',
    category: 'Corte',
    duration: '30',
    price: '0',
  })

  useEffect(() => {
    const carregarDados = async () => {
      const userSession = localStorage.getItem('user_session')
      if (!userSession) {
        return
      }
      
      try {
        const userData = JSON.parse(userSession)
        
        // Se já tem salonId, usa direto
        if (userData.salonId) {
          setSalonId(userData.salonId)
          const data = await getServicesBySalon(userData.salonId)
          setServices(data)
          return
        }
        
        // Se não tem salonId, busca do banco pelo userId
        const { getSalonById } = await import('@/app/actions/salon')
        const salonSession = localStorage.getItem('salon_session')
        if (salonSession) {
          const salon = JSON.parse(salonSession)
          setSalonId(salon.id)
          const data = await getServicesBySalon(salon.id)
          setServices(data)
        }
      } catch (error) {
        console.error('[v0] Erro ao carregar dados:', error)
      }
    }
    
    carregarDados()
  }, [])

  const loadServices = async (id: string) => {
    try {
      const data = await getServicesBySalon(id)
      setServices(data)
    } catch (error: any) {
      console.error('[v0] Erro ao carregar:', error)
      setToastMessage('Erro ao carregar serviços')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleAddService = () => {
    console.log('[v0] Salvando serviço com salonId:', salonId)
    
    if (!formData.name || !formData.price || parseFloat(formData.price) === 0) {
      setToastMessage('Preencha nome, categoria e preço')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (!salonId) {
      console.error('[v0] salonId é nulo!')
      setToastMessage('Erro: Salão não identificado')
      setToastType('error')
      setShowToast(true)
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateService(editingId, salonId, {
            name: formData.name,
            category: formData.category,
            duration: parseInt(formData.duration),
            price: formData.price,
          })
          setToastMessage('Serviço atualizado com sucesso!')
        } else {
          await addService(salonId, {
            name: formData.name,
            category: formData.category,
            duration: parseInt(formData.duration),
            price: formData.price,
          })
          setToastMessage('Serviço criado com sucesso!')
        }

        setFormData({ name: '', category: 'Corte', duration: '30', price: '0' })
        setEditingId(null)
        setShowForm(false)
        setToastType('success')
        setShowToast(true)
        await loadServices(salonId)

        // Sincronizar com localStorage para aparecer na página de clientes
        const userSession = localStorage.getItem('user_session')
        if (userSession) {
          const userData = JSON.parse(userSession)
          const salonSession = localStorage.getItem('salon_session')
          if (salonSession) {
            const salonData = JSON.parse(salonSession)
            const ownerAccounts = JSON.parse(localStorage.getItem('owner_accounts') || '[]')
            const accountIndex = ownerAccounts.findIndex((acc: any) => acc.salonId === salonData.id)
            if (accountIndex >= 0) {
              ownerAccounts[accountIndex].salon = {
                ...ownerAccounts[accountIndex].salon,
                services: await getServicesBySalon(salonId)
              }
              localStorage.setItem('owner_accounts', JSON.stringify(ownerAccounts))
            }
          }
        }
      } catch (error: any) {
        console.error('[v0] Erro:', error)
        setToastMessage(error.message || 'Erro ao salvar serviço')
        setToastType('error')
        setShowToast(true)
      }
    })
  }

  const handleDeleteService = (serviceId: string) => {
    if (!salonId) return

    startTransition(async () => {
      try {
        await deleteService(serviceId, salonId)
        setToastMessage('Serviço deletado com sucesso!')
        setToastType('success')
        setShowToast(true)
        await loadServices(salonId)
      } catch (error: any) {
        setToastMessage(error.message || 'Erro ao deletar serviço')
        setToastType('error')
        setShowToast(true)
      }
    })
  }

  const handleEditService = (service: any) => {
    setFormData({
      name: service.name,
      category: service.category,
      duration: service.duration.toString(),
      price: service.price,
    })
    setEditingId(service.id)
    setShowForm(true)
  }

  return (
    <DashboardLayout>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Scissors className="w-6 h-6 text-primary" />
              </div>
              Serviços
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie seus serviços e preços</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Serviço
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-primary/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</CardTitle>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({ name: '', category: 'Corte', duration: '30', price: '0' })
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Serviço</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Corte Masculino"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Corte"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duração (min)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Preço (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50.00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ name: '', category: 'Corte', duration: '30', price: '0' })
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddService} disabled={isPending} className="flex-1">
                  {isPending ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services List */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{service.category}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{service.duration} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço:</span>
                    <span className="font-medium text-primary">R$ {service.price}</span>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="flex-1 gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="flex-1 gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Nenhum serviço cadastrado ainda</p>
              <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Serviço
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
