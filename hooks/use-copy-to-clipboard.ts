import { useCallback } from 'react'

export function useCopyToClipboard() {
  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      // Tenta primeiro a API moderna
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback para celulares e navegadores antigos
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        
        // Para iOS, precisamos selecionar de forma especial
        if (navigator.userAgent.match(/iphone|ipad|ipod/i)) {
          const range = document.createRange()
          range.selectNodeContents(textArea)
          const selection = window.getSelection()
          selection?.removeAllRanges()
          selection?.addRange(range)
          textArea.setSelectionRange(0, 999999)
        } else {
          textArea.select()
        }

        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        return success
      }
    } catch (error) {
      console.error('[v0] Erro ao copiar:', error)
      return false
    }
  }, [])

  return { copy }
}
