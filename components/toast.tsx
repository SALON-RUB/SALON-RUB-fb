import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 3000, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-success',
    error: 'bg-destructive',
    info: 'bg-primary',
  }[type]

  const textColor = {
    success: 'text-success-foreground',
    error: 'text-destructive-foreground',
    info: 'text-primary-foreground',
  }[type]

  const icon = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <CheckCircle2 className="w-5 h-5" />,
  }[type]

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className={`${bgColor} ${textColor} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}>
        {icon}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
