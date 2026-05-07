import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import type { TReceiptSource } from '../model'

type TUseReceiptSourceModalParams = {
  /** Вызывается, когда пользователь выбрал способ загрузки чека и клиент уже инициировал диалог открытия файла. */
  onSourceSelected?: () => void
}

export const useReceiptSourceModal = ({ onSourceSelected }: TUseReceiptSourceModalParams = {}) => {
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const openSourceModal = () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      toast.error('API ключ не настроен. См. инструкцию в README.')
      return
    }
    setIsSourceOpen(true)
  }

  const handleSourceSelect = (source: TReceiptSource) => {
    setIsSourceOpen(false)
    window.setTimeout(() => {
      const inputRef = source === 'camera' ? cameraInputRef : fileInputRef
      inputRef.current?.click()
      onSourceSelected?.()
    }, 100)
  }

  return {
    fileInputRef,
    cameraInputRef,
    isSourceOpen,
    setIsSourceOpen,
    openSourceModal,
    handleSourceSelect,
  }
}
