'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Palette, Type } from 'lucide-react'
import { getPageSettingsByUserId, updatePageSettings } from '@/app/actions/page-settings'

export default function ConfiguracoesPagePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      setUserId(userData.userId)
      loadSettings(userData.userId)
    } catch (err) {
      console.error('[v0] Erro:', err)
      setLoading(false)
    }
  }, [router])

  async function loadSettings(id: string) {
    try {
      setLoading(true)
      const data = await getPageSettingsByUserId(id)
      if (data) {
        setSettings(data)
      } else {
        // Criar configurações padrão
        setSettings({
          salonId: id,
          pageName: 'Agende seu Horário',
          primaryColor: '#9333ea',
          secondaryColor: '#ffffff',
          backgroundColor: '#000000',
          textColor: '#ffffff',
          buttonText: 'Agendar',
        })
      }
    } catch (err: any) {
      console.error('[v0] Erro:', err)
      setSettings({
        salonId: id,
        pageName: 'Agende seu Horário',
        primaryColor: '#9333ea',
        secondaryColor: '#ffffff',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        buttonText: 'Agendar',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!userId || !settings) return

    try {
      setSaving(true)
      await updatePageSettings(userId, settings)
      alert('Configurações salvas com sucesso!')
    } catch (err: any) {
      console.error('[v0] Erro:', err)
      alert('Erro ao salvar')
    } finally {
      setSaving(false)
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
        <div className="p-6 text-center">Carregando...</div>
      </DashboardLayout>
    )
  }

  if (!settings && !loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Erro ao carregar configurações</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Página</h1>
          <p className="text-muted-foreground mt-2">
            Customize a página de agendamento do seu salão
          </p>
        </div>

        <div className="grid gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Página</label>
                <Input
                  value={settings.pageName || ''}
                  onChange={(e) => handleChange('pageName', e.target.value)}
                  placeholder="Ex: Agende seu Horário"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">URL da Logo</label>
                <Input
                  value={settings.logoUrl || ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mensagem de Boas-vindas</label>
                <Input
                  value={settings.welcomeMessage || ''}
                  onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                  placeholder="Ex: Bem-vindo ao nosso salão!"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Texto do Botão</label>
                <Input
                  value={settings.buttonText || ''}
                  onChange={(e) => handleChange('buttonText', e.target.value)}
                  placeholder="Ex: Agendar"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cor Primária</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.primaryColor || '#9333ea'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.primaryColor || '#9333ea'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Cor Secundária</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.secondaryColor || '#ffffff'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.secondaryColor || '#ffffff'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Cor de Fundo</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.backgroundColor || '#000000'}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.backgroundColor || '#000000'}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Cor do Texto</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.textColor || '#ffffff'}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={settings.textColor || '#ffffff'}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pré-visualização */}
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg p-6 text-center"
                style={{
                  backgroundColor: settings.backgroundColor || '#000000',
                }}
              >
                {settings.logoUrl && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      className="h-16 w-auto"
                    />
                  </div>
                )}
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: settings.primaryColor || '#9333ea' }}
                >
                  {settings.pageName || 'Agende seu Horário'}
                </h2>
                <p
                  className="mb-6"
                  style={{ color: settings.textColor || '#ffffff' }}
                >
                  {settings.welcomeMessage || 'Bem-vindo!'}
                </p>
                <button
                  className="px-6 py-2 rounded font-medium text-white"
                  style={{
                    backgroundColor: settings.primaryColor || '#9333ea',
                  }}
                >
                  {settings.buttonText || 'Agendar'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 text-base"
            size="lg"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
