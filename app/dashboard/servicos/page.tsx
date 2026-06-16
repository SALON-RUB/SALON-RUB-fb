'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast } from '@/components/toast'
import { Scissors, Plus, X, Edit2, Trash2 } from 'lucide-react'
import { createService, getServices, updateService, deleteService } from '@/app/actions/services'

export default function ServicosPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [services, setServices] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [formData, setFormData] = useState({
    name: '',
    category: 'corte',
    duration: '30',
    price: '0',
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await getServices()
      setServices(data)
    } catch (error: any) {
      setToastMessage('Erro ao carregar serviços')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleAddService = () => {
    if (!formData.name || !formData.price || parseFloat(formData.price) === 0) {
      setToastMessage('Preencha nome, categoria e preço')
      setToastType('error')
      setShowToast(true)
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateService(editingId, {
            name: formData.name,
            category: formData.category,
            duration: parseInt(formData.duration),
            price: formData.price,
          })
          setToastMessage('Serviço atualizado com sucesso!')
        } else {
          await createService({
            name: formData.name,
            category: formData.category,
            duration: parseInt(formData.duration),
            price: formData.price,
          })
          setToastMessage('Serviço criado com sucesso!')
        }

        setFormData({ name: '', category: 'corte', duration: '30', price: '0' })
        setEditingId(null)
        setShowForm(false)
        setToastType('success')
        setShowToast(true)
        await loadServices()
      } catch (error: any) {
        setToastMessage(error.message || 'Erro ao salvar serviço')
        setToastType('error')
        setShowToast(true)
      }
    })
  }

  const handleEdit = (service: any) => {
    setEditingId(service.id)
    setFormData({
      name: service.name,
      category: service.category,
      duration: service.duration.toString(),
      price: service.price.toString(),
    })
    setShowForm(true)
  }

  const handleDelete = (serviceId: string) => {
    if (confirm('Tem certeza que deseja deletar este serviço?')) {
      startTransition(async () => {
        try {
          await deleteService(serviceId)
          setToastMessage('Serviço deletado com sucesso!')
          setToastType('success')
          setShowToast(true)
          await loadServices()
        } catch (error: any) {
          setToastMessage(error.message || 'Erro ao deletar serviço')
          setToastType('error')
          setShowToast(true)
        }
      })
    }
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Scissors className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Serviços</h1>
              <p className="text-muted-foreground">Gerencie seus serviços e preços</p>
            </div>
          </div>
          {!showForm && (
            <Button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({ name: '', category: 'corte', duration: '30', price: '0' })
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Serviço
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</CardTitle>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ name: '', category: 'corte', duration: '30', price: '0' })
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Serviço</label>
                <Input
                  placeholder="Ex: Corte Masculino"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={isPending}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="corte">Corte</option>
                    <option value="barba">Barba</option>
                    <option value="coloracao">Coloração</option>
                    <option value="tratamento">Tratamento</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duração (min)</label>
                  <Input
                    type="number"
                    min="15"
                    max="240"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preço (R$)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={isPending}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ name: '', category: 'corte', duration: '30', price: '0' })
                  }}
                  disabled={isPending}
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

        <div className="grid gap-4">
          {services.length === 0 ? (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">Nenhum serviço cadastrado ainda</p>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{service.category}</span>
                        <span>{service.duration} min</span>
                        <span className="text-primary font-semibold">R$ {parseFloat(service.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                        disabled={isPending}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
