'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scissors, Plus, X, Edit2 } from 'lucide-react'

export default function ServicosPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'corte',
    duracao: '30',
    preco: '0',
  })

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
    if (userData?.salon?.services) {
      setServices(userData.salon.services)
    }
  }, [router])

  const handleAddService = () => {
    if (!formData.nome || !formData.preco || parseFloat(formData.preco) === 0) {
      alert('Preencha nome e preço')
      return
    }

    if (editingId) {
      const updated = services.map((s) =>
        s.id === editingId
          ? { ...s, ...formData, preco: parseFloat(formData.preco) }
          : s
      )
      setServices(updated)

      const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex >= 0) {
        users[userIndex].salon.services = updated
        localStorage.setItem('salon_users', JSON.stringify(users))
      }

      setEditingId(null)
    } else {
      const newService = {
        id: 'srv_' + Date.now(),
        ...formData,
        preco: parseFloat(formData.preco),
        duracao: parseInt(formData.duracao),
        criado_em: new Date().toISOString(),
      }

      setServices([...services, newService])

      const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex >= 0) {
        users[userIndex].salon.services = [...services, newService]
        localStorage.setItem('salon_users', JSON.stringify(users))
      }
    }

    setFormData({ nome: '', categoria: 'corte', duracao: '30', preco: '0' })
    setShowForm(false)
  }

  const handleEditService = (service: any) => {
    setFormData({
      nome: service.nome,
      categoria: service.categoria,
      duracao: String(service.duracao),
      preco: String(service.preco),
    })
    setEditingId(service.id)
    setShowForm(true)
  }

  const handleDeleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id)
    setServices(updated)

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex].salon.services = updated
      localStorage.setItem('salon_users', JSON.stringify(users))
    }
  }

  if (!user) return null

  const categorias = ['corte', 'coloração', 'tratamento', 'barba', 'outros']

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Serviços</h1>
            <p className="text-muted-foreground mt-1">Gerencie os serviços e preços do salão</p>
          </div>
          <Button onClick={() => {
            setEditingId(null)
            setFormData({ nome: '', categoria: 'corte', duracao: '30', preco: '0' })
            setShowForm(!showForm)
          }} className="gap-2">
            <Plus size={20} />
            Novo Serviço
          </Button>
        </div>

        {showForm && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{editingId ? 'Editar Serviço' : 'Adicionar Serviço'}</CardTitle>
              <button onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}>
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Serviço</label>
                <Input
                  placeholder="Ex: Corte Masculino"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duração (min)</label>
                  <Input
                    type="number"
                    value={formData.duracao}
                    onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleAddService} className="w-full">
                {editingId ? 'Atualizar Serviço' : 'Adicionar Serviço'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Serviços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors size={20} />
              Serviços Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhum serviço cadastrado. Clique em "Novo Serviço" para adicionar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">SERVIÇO</th>
                      <th className="text-left py-3 px-4 font-semibold">CATEGORIA</th>
                      <th className="text-left py-3 px-4 font-semibold">DURAÇÃO</th>
                      <th className="text-left py-3 px-4 font-semibold">PREÇO</th>
                      <th className="text-left py-3 px-4 font-semibold">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{service.nome}</td>
                        <td className="py-3 px-4 text-muted-foreground capitalize">{service.categoria}</td>
                        <td className="py-3 px-4">{service.duracao} min</td>
                        <td className="py-3 px-4 font-semibold">R$ {service.preco.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditService(service)}
                              className="p-2 hover:bg-accent rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 rounded transition-colors"
                              title="Deletar"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
