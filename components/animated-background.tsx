'use client'

import { useEffect, useRef } from 'react'

export type AnimatedBackgroundVariant = 'purple' | 'blue' | 'teal' | 'rose' | 'orange'

interface AnimatedBackgroundProps {
  variant?: AnimatedBackgroundVariant
}

export function AnimatedBackground({ variant = 'purple' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const colorSchemes: Record<AnimatedBackgroundVariant, string[]> = {
    purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
    blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
    teal: ['#14B8A6', '#2DD4BF', '#67E8F9', '#CCFBF1'],
    rose: ['#EC4899', '#F472B6', '#FBCFE8', '#FDF2F8'],
    orange: ['#F97316', '#FB923C', '#FED7AA', '#FFEDD5'],
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Particle {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      opacity: number
      color: string
    }

    const particles: Particle[] = []
    const particleCount = 50
    const colors = colorSchemes[variant]

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const animate = () => {
      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(13, 13, 13, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off walls
        if (particle.x - particle.radius < 0 || particle.x + particle.radius > canvas.width) {
          particle.vx *= -1
        }
        if (particle.y - particle.radius < 0 || particle.y + particle.radius > canvas.height) {
          particle.vy *= -1
        }

        // Draw particle with glow
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      })

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.strokeStyle = particles[i].color
            ctx.globalAlpha = (1 - distance / 150) * 0.2
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full bg-black/80" />
}
