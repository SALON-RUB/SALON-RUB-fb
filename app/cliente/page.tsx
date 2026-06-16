'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Scissors, Calendar, Clock, User } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'

export default function ClientePage() {
  const [step, setStep] = useState<'codigo' | 'agendamento' | 'confirmacao'>('codigo')
  const [salonCode, setSalonCode] = useState('')
  const [salon, setSalon] = useState<any>(null)
  const [error, setError] = useState('')

  // Dados do agendamento
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [servicoSelecionado, setServicoSelecionado] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horaSelecionada, setHoraSelecionada] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState<any>(null)

  const handleEntrarComCodigo = () => {
    setError('')
    if (!salonCode.trim()) {
      setError('Por favor insira o código do salão')
      return
    }

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const usuario = users.find((u: any) => u.salonCode === salonCode.toUpperCase())

    if (!usuario) {
      setError('Código do salão não encontrado')
      return
    }

    setSalon(usuario)
    setStep('agendamento')
  }

  const handleAgendar = () => {
    setError('')

    if (!nomeCliente.trim() || !telefoneCliente.trim() || !servicoSelecionado || !dataSelecionada || !horaSelecionada) {
      setError('Por favor preencha todos os campos')
      return
    }

    const servico = salon.salon?.services?.find((s: any) => s.id === servicoSelecionado)

    const novoAgendamento = {
      id: 'agd_' + Date.now(),
      cliente: nomeCliente,
      telefone: telefoneCliente,
      servico: servico?.nome,
      preco: servico?.preco,
      data: dataSelecionada,
      hora: horaSelecionada,
      duracao: servico?.duracao,
      observacoes,
      status: 'agendado',
      dataAgendamento: new Date().toISOString(),
    }

    const salonAtualizado = {
      ...salon,
      salon: {
        ...salon.salon,
        appointments: [...(salon.salon?.appointments || []), novoAgendamento],
      },
    }

    const users = JSON.parse(localStorage.getItem('salon_users') || '[]')
    const indice = users.findIndex((u: any) => u.id === salon.id)
    users[indice] = salonAtualizado
    localStorage.setItem('salon_users', JSON.stringify(users))

    setAgendamentoConfirmado(novoAgendamento)
    setStep('confirmacao')
  }

  const handleNovoAgendamento = () => {
    setNomeCliente('')
    setTelefoneCliente('')
    setServicoSelecionado('')
    setDataSelecionada('')
    setHoraSelecionada('')
    setObservacoes('')
    setStep('agendamento')
  }

  const horariosDisponiveis = Array.from({ length: 9 }, (_, i) => {
    const hora = String(9 + i).padStart(2, '0')
    return `${hora}:00`
  })

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AnimatedBackground />

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

                <Button onClick={handleEntrarComCodigo} className="w-full" size="lg">
                  Continuar
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
                  {salon.salon?.services && salon.salon.services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {salon.salon.services.map((servico: any) => (
                        <button
                          key={servico.id}
                          onClick={() => setServicoSelecionado(servico.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            servicoSelecionado === servico.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <p className="font-medium">{servico.nome}</p>
                          <p className="text-sm text-muted-foreground">{servico.duracao} min</p>
                          <p className="text-sm font-semibold text-primary">R$ {servico.preco.toFixed(2)}</p>
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
                      setStep('codigo')
                    }}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button onClick={handleAgendar} className="flex-1" size="lg">
                    Agendar
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
                      <p className="font-semibold">{agendamentoConfirmado.cliente}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-semibold">{agendamentoConfirmado.telefone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serviço</p>
                      <p className="font-semibold">{agendamentoConfirmado.servico}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-semibold text-primary">R$ {agendamentoConfirmado.preco.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-semibold">
                        {new Date(agendamentoConfirmado.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-semibold">{agendamentoConfirmado.hora}</p>
                    </div>
                  </div>

                  {agendamentoConfirmado.observacoes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="font-semibold">{agendamentoConfirmado.observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleNovoAgendamento} variant="outline" className="flex-1">
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
