import { createContext, useContext, useState, useEffect } from 'react'
import { StorageService } from '../services/storage'
import { toast } from 'react-hot-toast'
import authService from '../api/auth.service'

const AppContext = createContext()

export function AppProvider({ children }) {
  // Авторизация
  const [user, setUser] = useState(() => authService.getCurrentUser())
  
  // UI состояние
  const [paymentMode, setPaymentMode] = useState(() => StorageService.getPaymentMode())
  const [singlePayer, setSinglePayer] = useState(() => StorageService.getSinglePayer())
  const [isModalOpen, setIsModalOpen] = useState(null) // 'addPerson', 'addCost', null
  const [currentCheck, setCurrentCheck] = useState(null)

  // Сохраняем настройки UI в localStorage
  useEffect(() => {
    StorageService.setPaymentMode(paymentMode)
  }, [paymentMode])

  useEffect(() => {
    StorageService.setSinglePayer(singlePayer)
  }, [singlePayer])

  // Методы для работы с UI
  const changePaymentMode = (mode) => {
    if (mode === paymentMode) return

    if (mode === 'single') {
      if (!singlePayer) {
        toast.error('Выберите единого плательщика')
        return
      }
    } else if (mode === 'manual') {
      setSinglePayer(null)
    }

    setPaymentMode(mode)
    toast.success(`Режим оплаты изменен на ${mode === 'single' ? 'единый плательщик' : 'ручной'}`)
  }

  const selectSinglePayer = (person) => {
    setSinglePayer(person)
    toast.success(`${person.name} выбран как единый плательщик`)
  }

  const value = {
    // Авторизация
    user,
    setUser,
    logout: () => {
      authService.logout()
      setUser(null)
      StorageService.clearAll()
      toast.success('Вы вышли из системы')
    },

    // UI состояние
    paymentMode,
    singlePayer,
    isModalOpen,
    setIsModalOpen,
    currentCheck,
    setCurrentCheck,

    // UI методы
    changePaymentMode,
    selectSinglePayer
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
} 