'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus, X, Copy, Check } from 'lucide-react'

export default function EquipePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    especializacao: '',
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
    if (userData?.salon?.employees) {
      setEmployees(userData.salon.employees)
    }
  }, [router])

  const handleAddEmployee = () => {
    if (!formData.nome) {
      alert('Preencha o nome')
      return
    }

    const newEmployee = {
      id: 'emp_' + Date.now(),
      ...formData,
      criado_em: new Date().toISOString(),
    }

    setEmployees([...employees, newEmployee])

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex].salon.employees = [...employees, newEmployee]
      localStorage.setItem('salon_users', JSON.stringify(users))
    }

    setFormData({ nome: '', telefone: '', especializacao: '' })
    setShowForm(false)
  }

  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter((e) => e.id !== id)
    setEmployees(updated)

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex].salon.employees = updated
      localStorage.setItem('salon_users', JSON.stringify(users))
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.salonCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Equipe</h1>
            <p className="text-muted-foreground mt-1">Gerencie a equipe do salão</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={20} />
            Novo Membro
          </Button>
        </div>

        {/* Código do Salão */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-50/50 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">∞</div>
              Código do Salão
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compartilhe este código com a equipe e clientes para que eles possam se conectar ao seu salão.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <div className="flex-1 bg-black dark:bg-white rounded-lg px-6 py-4 text-center">
                <p className="text-2xl font-bold text-white dark:text-black tracking-widest">
                  {user.salonCode}
                </p>
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        {showForm && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Adicionar Membro</CardTitle>
              <button onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  placeholder="Nome do membro"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Especialização</label>
                <Input
                  placeholder="Ex: Cabelereiro, Manicure..."
                  value={formData.especializacao}
                  onChange={(e) => setFormData({ ...formData, especializacao: e.target.value })}
                />
              </div>

              <Button onClick={handleAddEmployee} className="w-full">
                Adicionar Membro
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Membros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Membros da Equipe
            </CardTitle>
            <p className="text-sm text-muted-foreground">{employees.length} membro(s)</p>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Nenhum membro cadastrado. Clique em "Novo Membro" para adicionar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map((emp) => (
                  <Card key={emp.id} className="bg-accent/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{emp.nome}</p>
                          {emp.especializacao && (
                            <p className="text-sm text-muted-foreground">{emp.especializacao}</p>
                          )}
                          {emp.telefone && (
                            <p className="text-sm text-muted-foreground">{emp.telefone}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
