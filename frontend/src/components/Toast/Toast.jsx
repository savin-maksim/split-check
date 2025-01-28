import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

function Toast() {
  const [isMobile, setIsMobile] = useState(false)
  const [visualViewport, setVisualViewport] = useState(null)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Обработчик изменения viewport (для поддержки виртуальной клавиатуры)
    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        setVisualViewport({
          height: window.visualViewport.height,
          offsetTop: window.visualViewport.offsetTop
        })
      }
    }

    checkIfMobile()
    handleVisualViewportChange()

    window.addEventListener('resize', checkIfMobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange)
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange)
    }

    return () => {
      window.removeEventListener('resize', checkIfMobile)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange)
        window.visualViewport.removeEventListener('scroll', handleVisualViewportChange)
      }
    }
  }, [])

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        top: isMobile ? (visualViewport?.offsetTop || 0) + 20 : 20,
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

export default Toast 