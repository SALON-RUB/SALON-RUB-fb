'use client'

import { useState, useEffect } from 'react'
import { getPageSettings, updatePageSettings } from '@/app/actions/page-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Palette, Type, Zap } from 'lucide-react'

export default function ConfiguracoesPagePage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      setError('')
      const data = await getPageSettings()
      setSettings(data)
    } catch (err) {
      setError('Erro ao carregar configurações')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      await updatePageSettings(settings)
      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao salvar configurações')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Erro ao carregar configurações</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configurações da Página do Cliente</h1>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid gap-6">
          {/* Seção de Branding */}
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Página</label>
                <input
                  type="text"
                  value={settings.pageName}
                  onChange={(e) => setSettings({ ...settings, pageName: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Agende seu Horário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL da Logo</label>
                <input
                  type="text"
                  value={settings.logoUrl || ''}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem de Boas-vindas</label>
                <textarea
                  value={settings.welcomeMessage || ''}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                  placeholder="Bem-vindo ao nosso salão!"
                />
              </div>
            </CardContent>
          </Card>

          {/* Seção de Cores */}
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Paleta de Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cor Principal</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cor Secundária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cor de Fundo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cor do Texto</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-background p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-3">Prévia das cores:</p>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: settings.backgroundColor,
                    borderColor: settings.primaryColor,
                    color: settings.textColor,
                  }}
                >
                  <h3 style={{ color: settings.primaryColor }} className="font-bold mb-2">
                    Titulo
                  </h3>
                  <p>Texto de exemplo com a paleta de cores selecionada</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Texto */}
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" />
                Textos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Texto do Botão de Agendamento</label>
                <input
                  type="text"
                  value={settings.buttonText}
                  onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Agendar"
                />
              </div>
            </CardContent>
          </Card>

          {/* Seção de Loyalty */}
          <Card className="bg-card/95 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Programa de Fidelização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.showLoyalty}
                  onChange={(e) => setSettings({ ...settings, showLoyalty: e.target.checked })}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
                <label className="text-sm font-medium cursor-pointer">Mostrar programa de fidelização</label>
              </div>

              {settings.showLoyalty && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pontos por Compra</label>
                    <input
                      type="number"
                      value={settings.loyaltyPointsPerPurchase}
                      onChange={(e) => setSettings({ ...settings, loyaltyPointsPerPurchase: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mensagem de Fidelização</label>
                    <textarea
                      value={settings.loyaltyMessage || ''}
                      onChange={(e) => setSettings({ ...settings, loyaltyMessage: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                      placeholder="Ex: Ganhe pontos a cada compra!"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button
              onClick={loadSettings}
              variant="outline"
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
