'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { getPageSettingsBySalonCode, updatePageSettingsBySalonCode, updatePageSettingsWithAI } from '@/app/actions/page-settings'
import { Palette, Upload, Type, Sparkles, AlertCircle } from 'lucide-react'

export default function ConfiguracoesPagePage() {
  const router = useRouter()
  const [settings, setSettings] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [aiRequest, setAiRequest] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    const userSession = localStorage.getItem('user_session')
    if (!userSession) {
      router.push('/')
      return
    }

    try {
      const userData = JSON.parse(userSession)
      if (userData.role !== 'owner') {
        router.push('/')
        return
      }
      setUser(userData)
      loadSettings(userData.salonCode)
    } catch (err) {
      console.error('[v0] Erro ao carregar sessão:', err)
      setError('Erro ao carregar sessão')
      setLoading(false)
    }
  }, [router])

  async function loadSettings(salonCode: string) {
    try {
      setLoading(true)
      setError('')
      const data = await getPageSettingsBySalonCode(salonCode)
      setSettings(data)
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar configurações')
      console.error('[v0] Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!user) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      await updatePageSettingsBySalonCode(user.salonCode, settings)
      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar configurações')
      console.error('[v0] Erro:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleAIRequest() {
    if (!user || !aiRequest.trim()) return

    try {
      setAiLoading(true)
      setError('')
      setSuccess('')

      const response = await updatePageSettingsWithAI(user.salonCode, aiRequest)
      
      if (response.success && response.settings) {
        setSettings(response.settings)
        setSuccess(response.message)
        setAiRequest('')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar solicitação IA')
      console.error('[v0] Erro:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Carregando configurações...</div>
      </DashboardLayout>
    )
  }

  if (!user || !settings) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-red-500">Erro ao carregar configurações</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configurações da Página</h1>
          <p className="text-muted-foreground">
            Personalize a página de agendamento dos seus clientes
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Preview Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!preview ? 'default' : 'outline'}
            onClick={() => setPreview(false)}
          >
            Editar
          </Button>
          <Button
            variant={preview ? 'default' : 'outline'}
            onClick={() => setPreview(true)}
          >
            Pré-visualizar
          </Button>
        </div>

        {!preview ? (
          <>
            {/* IA Assistant */}
            <Card className="bg-purple-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Assistente de Design (IA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Descreva o que você quer mudar e a IA vai fazer as alterações automaticamente.
                </p>
                <Textarea
                  placeholder="Ex: Mude as cores para tons de rosa e branco, deixe mais elegante e coloque um texto de boas-vindas"
                  value={aiRequest}
                  onChange={(e) => setAiRequest(e.target.value)}
                  className="min-h-24"
                />
                <Button
                  onClick={handleAIRequest}
                  disabled={aiLoading || !aiRequest.trim()}
                  className="w-full gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiLoading ? 'Processando...' : 'Aplicar Alterações com IA'}
                </Button>
              </CardContent>
            </Card>

            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome da Página</Label>
                  <Input
                    value={settings.pageName || ''}
                    onChange={(e) => handleChange('pageName', e.target.value)}
                    placeholder="Agende seu Horário"
                  />
                </div>

                <div>
                  <Label>Mensagem de Boas-vindas</Label>
                  <Textarea
                    value={settings.welcomeMessage || ''}
                    onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                    placeholder="Bem-vindo ao nosso salão!"
                    className="min-h-20"
                  />
                </div>

                <div>
                  <Label>Texto do Botão de Agendamento</Label>
                  <Input
                    value={settings.buttonText || ''}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                    placeholder="Agendar"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo e Imagens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Logo e Imagens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>URL da Logo</Label>
                  <Input
                    value={settings.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {settings.logoUrl && (
                    <div className="mt-3 p-3 bg-gray-100 rounded">
                      <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Paleta de Cores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cor Primária (Botões/Títulos)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryColor || '#9333ea'}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        className="w-12 h-10 cursor-pointer"
                      />
                      <Input
                        value={settings.primaryColor || '#9333ea'}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        placeholder="#9333ea"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryColor || '#ffffff'}
                        onChange={(e) => handleChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 cursor-pointer"
                      />
                      <Input
                        value={settings.secondaryColor || '#ffffff'}
                        onChange={(e) => handleChange('secondaryColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.backgroundColor || '#000000'}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="w-12 h-10 cursor-pointer"
                      />
                      <Input
                        value={settings.backgroundColor || '#000000'}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.textColor || '#ffffff'}
                        onChange={(e) => handleChange('textColor', e.target.value)}
                        className="w-12 h-10 cursor-pointer"
                      />
                      <Input
                        value={settings.textColor || '#ffffff'}
                        onChange={(e) => handleChange('textColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fidelização */}
            <Card>
              <CardHeader>
                <CardTitle>Programa de Fidelização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar Programa de Fidelização</Label>
                  <Switch
                    checked={settings.showLoyalty || false}
                    onCheckedChange={(checked) => handleChange('showLoyalty', checked)}
                  />
                </div>

                {settings.showLoyalty && (
                  <>
                    <div>
                      <Label>Pontos por Compra</Label>
                      <Input
                        type="number"
                        value={settings.loyaltyPointsPerPurchase || '1'}
                        onChange={(e) => handleChange('loyaltyPointsPerPurchase', e.target.value)}
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <Label>Mensagem de Fidelização</Label>
                      <Textarea
                        value={settings.loyaltyMessage || ''}
                        onChange={(e) => handleChange('loyaltyMessage', e.target.value)}
                        placeholder="Ganhe pontos a cada compra!"
                        className="min-h-20"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="lg" className="flex-1">
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </>
        ) : (
          /* Preview */
          <Card>
            <CardContent className="pt-6">
              <div
                className="p-6 rounded-lg space-y-4"
                style={{
                  backgroundColor: settings.backgroundColor,
                  color: settings.textColor,
                }}
              >
                {settings.logoUrl && (
                  <div className="flex justify-center mb-4">
                    <img src={settings.logoUrl} alt="Logo" className="h-20 object-contain" />
                  </div>
                )}

                <h1 className="text-3xl font-bold text-center">{settings.pageName}</h1>

                {settings.welcomeMessage && (
                  <p className="text-center text-lg">{settings.welcomeMessage}</p>
                )}

                <button
                  className="w-full py-3 rounded font-bold text-lg"
                  style={{
                    backgroundColor: settings.primaryColor,
                    color: settings.textColor,
                  }}
                >
                  {settings.buttonText || 'Agendar'}
                </button>

                {settings.showLoyalty && settings.loyaltyMessage && (
                  <div
                    className="p-4 rounded text-center"
                    style={{
                      backgroundColor: settings.secondaryColor,
                      color: settings.primaryColor,
                    }}
                  >
                    {settings.loyaltyMessage}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
