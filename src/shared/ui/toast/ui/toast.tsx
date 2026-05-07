import { useEffect, useState } from 'react'
import { Toaster, toast, useToasterStore } from 'react-hot-toast'

import './toast.scss'

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
      containerClassName="toast-container"
      containerStyle={{ top: isMobile ? viewportOffset + 20 : 20 }}
      toastOptions={{
        duration: 3000,
        className: 'toast-item',
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
