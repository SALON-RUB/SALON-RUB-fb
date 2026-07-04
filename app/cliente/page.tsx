'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Scissors, Calendar, Clock, User } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'
import { createAppointment } from '@/app/actions/appointments'

export default function ClientePage() {
  const [step, setStep] = useState<'codigo' | 'agendamento' | 'confirmacao'>('codigo')
  const [salonCode, setSalonCode] = useState('')
  const [salon, setSalon] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Dados do agendamento
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [servicoSelecionado, setServicoSelecionado] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horaSelecionada, setHoraSelecionada] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState<any>(null)

  const handleEntrarComCodigo = async () => {
    setError('')
    setLoading(true)
    
    if (!salonCode.trim()) {
      setError('Por favor insira o código do salão')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/salons/${salonCode.toUpperCase()}`)
      if (!response.ok) {
        setError('Código do salão não encontrado')
        setLoading(false)
        return
      }

      const salonData = await response.json()
      setSalon(salonData)
      setServices(salonData.services || [])
      setStep('agendamento')
    } catch (err) {
      setError('Erro ao buscar informações do salão')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAgendar = async () => {
    setError('')
    setLoading(true)

    if (!nomeCliente.trim() || !telefoneCliente.trim() || !servicoSelecionado || !dataSelecionada || !horaSelecionada) {
      setError('Por favor preencha todos os campos')
      setLoading(false)
      return
    }

    try {
      const result = await createAppointment({
        salonCode: salonCode.toUpperCase(),
        clientName: nomeCliente,
        clientPhone: telefoneCliente,
        serviceId: servicoSelecionado,
        appointmentDate: dataSelecionada,
        appointmentTime: horaSelecionada,
        notes: observacoes,
      })

      const servico = services.find((s) => s.id === servicoSelecionado)
      setAgendamentoConfirmado({
        ...result,
        serviceName: servico?.name,
        servicePrice: servico?.price,
      })
      setStep('confirmacao')
    } catch (err) {
      setError('Erro ao agendar. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const horariosDisponiveis = Array.from({ length: 9 }, (_, i) => {
    const hora = String(9 + i).padStart(2, '0')
    return `${hora}:00`
  })

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AnimatedBackground variant="teal" />

      <div className="relative flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 mb-4">
              <Scissors className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Salon Rub</h1>
            <p className="text-muted-foreground">Agende seu horário</p>
          </div>

          {step === 'codigo' && (
            <Card className="bg-card/95 backdrop-blur border-border">
              <CardHeader>
                <CardTitle>Bem-vindo!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Insira o código do salão para visualizar os serviços disponíveis
                  </p>
                  <Input
                    placeholder="Ex: A7K9M2"
                    value={salonCode}
                    onChange={(e) => setSalonCode(e.target.value.toUpperCase())}
                    className="text-center font-mono text-lg tracking-widest"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/20 border border-destructive/50 text-destructive rounded-lg p-3 text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  onClick={handleEntrarComCodigo} 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Continuar'}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'agendamento' && salon && (
            <Card className="bg-card/95 backdrop-blur border-border">
              <CardHeader>
                <CardTitle>{salon.salon.name || 'Agende seu Horário'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Seus Dados
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Seu nome"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                    />
                    <Input
                      placeholder="Seu telefone"
                      value={telefoneCliente}
                      onChange={(e) => setTelefoneCliente(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-primary" />
                    Selecione o Serviço
                  </h3>
                  {services && services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {services.map((servico: any) => (
                        <button
                          key={servico.id}
                          onClick={() => setServicoSelecionado(servico.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            servicoSelecionado === servico.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <p className="font-medium">{servico.name}</p>
                          <p className="text-sm text-muted-foreground">{servico.duration} min</p>
                          <p className="text-sm font-semibold text-primary">R$ {parseFloat(servico.price || '0').toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                      Nenhum serviço disponível no momento
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Data
                    </h3>
                    <Input
                      type="date"
                      value={dataSelecionada}
                      onChange={(e) => setDataSelecionada(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Horário
                    </h3>
                    <select
                      value={horaSelecionada}
                      onChange={(e) => setHoraSelecionada(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    >
                      <option value="">Selecione um horário</option>
                      {horariosDisponiveis.map((hora) => (
                        <option key={hora} value={hora}>
                          {hora}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold mb-2 block">Observações (opcional)</label>
                  <textarea
                    placeholder="Alguma observação ou preferência?"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="bg-destructive/20 border border-destructive/50 text-destructive rounded-lg p-3 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSalonCode('')
                      setSalon(null)
                      setServices([])
                      setStep('codigo')
                    }}
                    className="flex-1"
                    disabled={loading}
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleAgendar} 
                    className="flex-1" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Agendando...' : 'Agendar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'confirmacao' && agendamentoConfirmado && (
            <Card className="bg-card/95 backdrop-blur border-border">
              <CardHeader>
                <CardTitle className="text-green-600">Agendamento Confirmado!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Seu agendamento foi confirmado com sucesso!</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-semibold">{agendamentoConfirmado.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-semibold">{agendamentoConfirmado.clientPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serviço</p>
                      <p className="font-semibold">{agendamentoConfirmado.serviceName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-semibold text-primary">R$ {parseFloat(agendamentoConfirmado.servicePrice || '0').toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-semibold">
                        {new Date(agendamentoConfirmado.appointmentDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-semibold">{agendamentoConfirmado.appointmentTime}</p>
                    </div>
                  </div>

                  {agendamentoConfirmado.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="font-semibold">{agendamentoConfirmado.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      setNomeCliente('')
                      setTelefoneCliente('')
                      setServicoSelecionado('')
                      setDataSelecionada('')
                      setHoraSelecionada('')
                      setObservacoes('')
                      setStep('agendamento')
                    }} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Novo Agendamento
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="flex-1"
                  >
                    Voltar para Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
