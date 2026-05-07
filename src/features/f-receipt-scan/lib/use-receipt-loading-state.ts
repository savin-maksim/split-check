import { useRef, useState } from 'react'

export const useReceiptLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const start = (): AbortController => {
    const controller = new AbortController()
    abortControllerRef.current = controller
    setIsLoading(true)
    setIsMinimized(false)
    return controller
  }

  const finish = () => {
    setIsLoading(false)
    setIsMinimized(false)
    abortControllerRef.current = null
  }

  const cancel = () => {
    abortControllerRef.current?.abort()
  }

  const minimize = () => setIsMinimized(true)
  const expand = () => setIsMinimized(false)

  return { isLoading, isMinimized, start, finish, cancel, minimize, expand }
}
