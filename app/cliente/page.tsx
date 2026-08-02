'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Scissors, Calendar, Clock, User, CheckCircle } from 'lucide-react'
import { createAppointment } from '@/app/actions/appointments'
import { getSalonByCode, getServicesBySalon } from '@/app/actions/salon'

export default function ClientePage() {
  const [step, setStep] = useState<'codigo' | 'agendamento' | 'confirmacao'>('codigo')
  const [salonCode, setSalonCode] = useState('')
  const [salon, setSalon] = useState<any>(null)
  const [pageSettings, setPageSettings] = useState<any>(null)
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
      // Buscar salão no banco
      const salonData = await getSalonByCode(salonCode.toUpperCase())
      if (!salonData) {
        setError('Código do salão não encontrado')
        setLoading(false)
        return
      }

      // Buscar serviços
      const salonServices = await getServicesBySalon(salonData.id)
      setServices(salonServices || [])

      setSalon({
        id: salonData.id,
        code: salonCode.toUpperCase(),
        name: salonData.name || 'Agende seu Horário',
      })
      
      setStep('agendamento')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar informações do salão')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAgendar = async () => {
    if (!nomeCliente || !telefoneCliente || !servicoSelecionado || !dataSelecionada || !horaSelecionada) {
      setError('Por favor preencha todos os campos')
      return
    }

    try {
      setError('')
      setLoading(true)

      const novoAgendamento = await createAppointment({
        salonCode: salon.code,
        clientName: nomeCliente,
        clientPhone: telefoneCliente,
        serviceId: servicoSelecionado,
        appointmentDate: dataSelecionada,
        appointmentTime: horaSelecionada,
        notes: observacoes,
      })

      setAgendamentoConfirmado(novoAgendamento)
      setStep('confirmacao')

      // Limpar formulário
      setNomeCliente('')
      setTelefoneCliente('')
      setServicoSelecionado('')
      setDataSelecionada('')
      setHoraSelecionada('')
      setObservacoes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao agendar')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    setStep('codigo')
    setSalon(null)
    setPageSettings(null)
    setServices([])
    setSalonCode('')
    setError('')
  }

  const handleNovoAgendamento = () => {
    setStep('agendamento')
    setAgendamentoConfirmado(null)
    setNomeCliente('')
    setTelefoneCliente('')
    setServicoSelecionado('')
    setDataSelecionada('')
    setHoraSelecionada('')
    setObservacoes('')
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: pageSettings?.backgroundColor || '#000000',
        color: pageSettings?.textColor || '#ffffff',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {pageSettings?.logoUrl && (
              <img
                src={pageSettings.logoUrl}
                alt="Logo"
                className="h-12 object-contain mb-2"
              />
            )}
            <h1
              className="text-2xl md:text-4xl font-bold"
              style={{ color: pageSettings?.primaryColor || '#9333ea' }}
            >
              Salon Rub
            </h1>
          </div>
          {step !== 'codigo' && (
            <Button
              onClick={handleVoltar}
              variant="outline"
              className="border-current"
            >
              Voltar
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Passo 1: Inserir Código */}
        {step === 'codigo' && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Card
              className="w-full max-w-md bg-card/95 backdrop-blur border"
              style={{ borderColor: pageSettings?.primaryColor || '#9333ea' }}
            >
              <CardHeader>
                <CardTitle
                  style={{ color: pageSettings?.primaryColor || '#9333ea' }}
                >
                  {pageSettings?.welcomeMessage || 'Insira o código do salão para continuar'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="Código do salão"
                  value={salonCode}
                  onChange={(e) => setSalonCode(e.target.value.toUpperCase())}
                  className="uppercase"
                  onKeyPress={(e) => e.key === 'Enter' && handleEntrarComCodigo()}
                />
                <Button
                  onClick={handleEntrarComCodigo}
                  disabled={loading}
                  className="w-full"
                  style={{
                    backgroundColor: pageSettings?.primaryColor || '#9333ea',
                    color: pageSettings?.secondaryColor || '#ffffff',
                  }}
                >
                  {loading ? 'Buscando...' : pageSettings?.buttonText || 'Continuar'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Passo 2: Agendamento */}
        {step === 'agendamento' && salon && (
          <div className="max-w-2xl mx-auto">
            <Card
              className="bg-card/95 backdrop-blur border"
              style={{
                borderColor: pageSettings?.primaryColor || '#9333ea',
              }}
            >
              <CardHeader>
                <CardTitle
                  style={{ color: pageSettings?.primaryColor || '#9333ea' }}
                >
                  {salon.name || 'Agende seu Horário'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Seus Dados
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Nome completo"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      className="bg-background border-border"
                    />
                    <Input
                      placeholder="Telefone"
                      value={telefoneCliente}
                      onChange={(e) => setTelefoneCliente(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                {/* Seleção de Serviço */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Selecione um Serviço
                  </h3>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      >
                        <input
                          type="radio"
                          name="servico"
                          checked={servicoSelecionado === service.id}
                          onChange={() => setServicoSelecionado(service.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration} min - R$ {parseFloat(service.price).toFixed(2)}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Data e Hora */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data e Hora
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={dataSelecionada}
                      onChange={(e) => setDataSelecionada(e.target.value)}
                      className="bg-background border-border"
                    />
                    <Input
                      type="time"
                      value={horaSelecionada}
                      onChange={(e) => setHoraSelecionada(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <h3 className="font-semibold mb-3">Observações (Opcional)</h3>
                  <textarea
                    placeholder="Alguma informação importante?"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg resize-none h-20"
                  />
                </div>

                {/* Fidelização */}
                {pageSettings?.showLoyalty && pageSettings?.loyaltyMessage && (
                  <div
                    className="p-4 rounded-lg border-2"
                    style={{
                      borderColor: pageSettings?.primaryColor || '#9333ea',
                      backgroundColor: `${pageSettings?.primaryColor}15`,
                    }}
                  >
                    <p className="text-sm">{pageSettings.loyaltyMessage}</p>
                  </div>
                )}

                {/* Botão de Agendar */}
                <Button
                  onClick={handleAgendar}
                  disabled={loading}
                  className="w-full py-6 font-semibold"
                  style={{
                    backgroundColor: pageSettings?.primaryColor || '#9333ea',
                    color: pageSettings?.secondaryColor || '#ffffff',
                  }}
                >
                  {loading ? 'Agendando...' : pageSettings?.buttonText || 'Agendar'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Passo 3: Confirmação */}
        {step === 'confirmacao' && agendamentoConfirmado && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <Card
              className="w-full max-w-md bg-card/95 backdrop-blur border-2"
              style={{ borderColor: '#10b981' }}
            >
              <CardHeader className="text-center">
                <CheckCircle
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: '#10b981' }}
                />
                <CardTitle className="text-green-600">Agendamento Confirmado!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Cliente:</strong> {agendamentoConfirmado.clientName}
                  </p>
                  <p>
                    <strong>Data:</strong> {new Date(agendamentoConfirmado.appointmentDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p>
                    <strong>Hora:</strong> {agendamentoConfirmado.appointmentTime}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {agendamentoConfirmado.clientPhone}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleNovoAgendamento}
                    className="flex-1"
                    style={{
                      backgroundColor: pageSettings?.primaryColor || '#9333ea',
                      color: pageSettings?.secondaryColor || '#ffffff',
                    }}
                  >
                    Novo Agendamento
                  </Button>
                  <Button
                    onClick={handleVoltar}
                    variant="outline"
                    className="flex-1"
                  >
                    Sair
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
