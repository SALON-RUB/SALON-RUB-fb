'use client'

import { useState, useEffect, useTransition } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast } from '@/components/toast'
import { Users, Plus, X, Edit2, Trash2, Mail, Phone } from 'lucide-react'
import { addEmployee, getEmployees, updateEmployee, deleteEmployee } from '@/app/actions/employees'

export default function FuncionariosPage() {
  const [isPending, startTransition] = useTransition()
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee' as 'employee' | 'manager',
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (error: any) {
      setToastMessage('Erro ao carregar funcionários')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleAddEmployee = () => {
    if (!formData.name || !formData.email) {
      setToastMessage('Preencha nome e email')
      setToastType('error')
      setShowToast(true)
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateEmployee(editingId, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          })
          setToastMessage('Funcionário atualizado com sucesso!')
        } else {
          await addEmployee({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          })
          setToastMessage('Funcionário adicionado com sucesso!')
        }

        setFormData({ name: '', email: '', phone: '', role: 'employee' })
        setEditingId(null)
        setShowForm(false)
        setToastType('success')
        setShowToast(true)
        await loadEmployees()
      } catch (error: any) {
        setToastMessage(error.message || 'Erro ao salvar funcionário')
        setToastType('error')
        setShowToast(true)
      }
    })
  }

  const handleEdit = (employee: any) => {
    setEditingId(employee.id)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
    })
    setShowForm(true)
  }

  const handleDelete = (employeeId: string) => {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
      startTransition(async () => {
        try {
          await deleteEmployee(employeeId)
          setToastMessage('Funcionário removido com sucesso!')
          setToastType('success')
          setShowToast(true)
          await loadEmployees()
        } catch (error: any) {
          setToastMessage(error.message || 'Erro ao remover funcionário')
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
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Funcionários</h1>
              <p className="text-muted-foreground">Gerencie sua equipe de trabalho</p>
            </div>
          </div>
          {!showForm && (
            <Button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({ name: '', email: '', phone: '', role: 'employee' })
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Funcionário
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</CardTitle>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ name: '', email: '', phone: '', role: 'employee' })
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <Input
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <Input
                    type="tel"
                    placeholder="(11) 9 9999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cargo</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    disabled={isPending}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="employee">Funcionário</option>
                    <option value="manager">Gerente</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ name: '', email: '', phone: '', role: 'employee' })
                  }}
                  disabled={isPending}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddEmployee} disabled={isPending} className="flex-1">
                  {isPending ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {employees.length === 0 ? (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">Nenhum funcionário cadastrado</p>
            </Card>
          ) : (
            employees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{employee.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {employee.phone}
                          </div>
                        )}
                        <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          {employee.role === 'manager' ? 'Gerente' : 'Funcionário'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                        disabled={isPending}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
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
