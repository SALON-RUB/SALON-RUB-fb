'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Scissors } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'

export default function ClientePage() {
  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30">
              <Scissors className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Salon Rub</h1>
            <p className="text-muted-foreground">Agende seu horário</p>
          </div>

          <Card className="bg-card/40 backdrop-blur-sm border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Página de agendamento de clientes em desenvolvimento...
                </p>
                <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
