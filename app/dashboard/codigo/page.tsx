'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/toast'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Copy, Check, Key } from 'lucide-react'

export default function CodigoSalaoPage() {
  const router = useRouter()
  const { copy } = useCopyToClipboard()
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('salon_session')
    if (!session) {
      router.push('/sign-in')
      return
    }

    setUser(JSON.parse(session))
  }, [router])

  const handleCopyCode = async () => {
    const success = await copy(user?.salonCode || '')
    if (success) {
      setToastMessage('Código copiado com sucesso!')
      setCopied(true)
      setShowToast(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setToastMessage('Erro ao copiar código. Tente novamente.')
      setShowToast(true)
    }
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/cliente?codigo=${user?.salonCode}`
    const success = await copy(link)
    if (success) {
      setToastMessage('Link copiado com sucesso!')
      setCopiedLink(true)
      setShowToast(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } else {
      setToastMessage('Erro ao copiar link. Tente novamente.')
      setShowToast(true)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <Toast
        message={toastMessage}
        type={toastMessage.includes('Erro') ? 'error' : 'success'}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Código do Salão</h1>
          <p className="text-muted-foreground mt-1">Compartilhe o código para conectar a equipe e clientes</p>
        </div>

        {/* Código de Conexão */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Código de Conexão
            </CardTitle>
            <p className="text-sm text-muted-foreground">Código único do seu salão</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black dark:bg-white rounded-lg px-8 py-6 text-center">
              <p className="text-4xl font-bold text-white dark:text-black tracking-widest">
                {user.salonCode}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">Código único do seu salão</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopyCode}
                className="flex-1 gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar Código'}
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Copy size={16} />
                Copiar Link do Site
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Como Usar */}
        <Card>
          <CardHeader>
            <CardTitle>Como usar o código</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-semibold">Equipe</p>
                  <p className="text-sm text-muted-foreground">
                    Ao fazer login, o membro da equipe usa o email e senha cadastrados pelo dono.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-semibold">Clientes</p>
                  <p className="text-sm text-muted-foreground">
                    O cliente informa o código do salão junto com nome e telefone, para visualizar os serviços e agendar.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-semibold">Site do Cliente</p>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe o link do site para que clientes possam acessar diretamente sem precisar inserir o código manualmente.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Salão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nome do Proprietário</p>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Código do Salão</p>
              <p className="font-mono font-semibold text-lg">{user.salonCode}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
