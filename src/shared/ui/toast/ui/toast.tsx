import { useEffect, useState } from 'react'
import { Toaster, toast, useToasterStore } from 'react-hot-toast'

const TOAST_LIMIT = 2

export const Toast = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [viewportOffset, setViewportOffset] = useState(0)
  const { toasts } = useToasterStore()

  useEffect(() => {
    const visible = toasts.filter((t) => t.visible)
    if (visible.length <= TOAST_LIMIT) return
    visible.slice(TOAST_LIMIT).forEach((t) => toast.dismiss(t.id))
  }, [toasts])

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        setViewportOffset(window.visualViewport.offsetTop)
      }
    }

    checkIfMobile()
    handleVisualViewportChange()

    window.addEventListener('resize', checkIfMobile)
    window.visualViewport?.addEventListener('resize', handleVisualViewportChange)
    window.visualViewport?.addEventListener('scroll', handleVisualViewportChange)

    return () => {
      window.removeEventListener('resize', checkIfMobile)
      window.visualViewport?.removeEventListener('resize', handleVisualViewportChange)
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportChange)
    }
  }, [])

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        top: isMobile ? viewportOffset + 20 : 20,
        position: 'fixed',
        zIndex: 10000,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 'var(--border-radius)',
          color: 'var(--color-light)',
          padding: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: 'var(--cards-width)',
          fontSize: '0.875rem',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-orange)',
            secondary: 'rgba(255, 255, 255, 1)',
          },
        },
      }}
    />
  )
}
