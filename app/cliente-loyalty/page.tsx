'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedBackground } from '@/components/animated-background'
import { Gift, Sparkles, TrendingUp, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ClienteLoyaltyPage() {
  const router = useRouter()
  const [clientPoints] = useState(Math.floor(Math.random() * 1000) + 100)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null)

  const discounts = [
    { id: 1, name: '10% de Desconto', points: 100, value: 'R$ 10' },
    { id: 2, name: 'Serviço Grátis', points: 200, value: 'Corte completo' },
    { id: 3, name: '20% de Desconto', points: 250, value: 'R$ 30' },
    { id: 4, name: 'Pacote VIP', points: 500, value: 'R$ 150' },
  ]

  const handleUseDiscount = (discount: any) => {
    if (clientPoints >= discount.points) {
      setSelectedDiscount(discount)
      setShowDiscountModal(true)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AnimatedBackground variant="client" />

      <div className="relative flex-1 flex flex-col items-center justify-start p-4 z-10 pt-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/20 backdrop-blur-sm border border-pink-500/30 mb-4">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Salon Rub</h1>
            <p className="text-muted-foreground">Programa de Fidelização</p>
          </div>

          {/* Card Principal de Pontos */}
          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur border-pink-500/30 mb-6">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Seus Pontos</p>
                <p className="text-6xl font-bold text-pink-500 mb-2">{clientPoints}</p>
                <p className="text-muted-foreground">Pontos disponíveis para resgatar</p>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima Recompensa</p>
                    <p className="text-2xl font-bold text-primary">{Math.max(100 - (clientPoints % 100), 1)}</p>
                  </div>
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Visitas</p>
                    <p className="text-2xl font-bold text-purple-500">{Math.floor(clientPoints / 50)}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold text-green-500">VIP</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Gift className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Como Funciona */}
          <Card className="bg-card/80 backdrop-blur border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-pink-500">1</div>
                  <div>
                    <p className="font-medium">Ganhe Pontos</p>
                    <p className="text-sm text-muted-foreground">Cada R$ 1,00 gasto = 1 ponto</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-pink-500">2</div>
                  <div>
                    <p className="font-medium">Acumule Benefícios</p>
                    <p className="text-sm text-muted-foreground">Cada 100 pontos = 1 recompensa</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-pink-500">3</div>
                  <div>
                    <p className="font-medium">Use seus Descontos</p>
                    <p className="text-sm text-muted-foreground">Resgate pontos por recompensas incríveis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descontos Disponíveis */}
          <Card className="bg-card/80 backdrop-blur border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Resgatar Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discounts.map((discount) => (
                  <div 
                    key={discount.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      clientPoints >= discount.points
                        ? 'border-pink-500/50 bg-pink-500/10 hover:border-pink-500'
                        : 'border-muted bg-muted/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{discount.name}</p>
                        <p className="text-xs text-muted-foreground">{discount.value}</p>
                      </div>
                      <span className="text-lg font-bold text-pink-500">{discount.points}pts</span>
                    </div>
                    <Button
                      onClick={() => handleUseDiscount(discount)}
                      disabled={clientPoints < discount.points}
                      className="w-full"
                      variant={clientPoints >= discount.points ? 'default' : 'outline'}
                    >
                      {clientPoints >= discount.points ? 'Usar Pontos' : 'Pontos Insuficientes'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card className="bg-card/80 backdrop-blur border-border mb-8">
            <CardHeader>
              <CardTitle>Histórico de Pontos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-pink-500" />
                      </div>
                      <div>
                        <p className="font-medium">Serviço realizado</p>
                        <p className="text-xs text-muted-foreground">{new Date(Date.now() - i * 86400000 * 7).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className="font-bold text-pink-500">+{Math.floor(Math.random() * 100) + 30}p</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Desconto */}
      {showDiscountModal && selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Cupom de Desconto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary mb-2">{selectedDiscount.name}</p>
                <p className="text-muted-foreground">{selectedDiscount.value}</p>
              </div>
              
              <div className="p-4 border-2 border-dashed border-primary rounded-lg text-center bg-primary/5">
                <p className="text-xs text-muted-foreground mb-2">Código</p>
                <p className="font-mono font-bold text-lg tracking-widest">SALON{Math.random().toString(36).substring(7).toUpperCase()}</p>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Apresente este código no seu próximo agendamento para usar o desconto!
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDiscountModal(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`SALON${Math.random().toString(36).substring(7).toUpperCase()}`)
                    setShowDiscountModal(false)
                  }}
                  className="flex-1"
                >
                  Copiar Código
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}
