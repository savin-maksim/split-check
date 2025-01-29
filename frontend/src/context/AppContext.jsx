import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { StorageService } from '../services/storage'
import { validatePerson, validateCost } from '../utils/validation'
import { toast } from 'react-hot-toast'
import authService from '../api/auth.service'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [people, setPeople] = useState(() => StorageService.getPeople())
  const [costs, setCosts] = useState(() => StorageService.getCosts())
  const [paymentMode, setPaymentMode] = useState(() => StorageService.getPaymentMode())
  const [singlePayer, setSinglePayer] = useState(() => StorageService.getSinglePayer())
  const [manualModeCosts, setManualModeCosts] = useState([]) // Сохраняем состояние расходов для ручного режима
  const [transfers, setTransfers] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [isPayerModalOpen, setIsPayerModalOpen] = useState(false)
  const [pendingCosts, setPendingCosts] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(null) // 'addPerson', 'addCost', null

  // Save to localStorage when data changes
  useEffect(() => {
    StorageService.setPeople(people)
  }, [people])

  useEffect(() => {
    StorageService.setCosts(costs)
  }, [costs])

  useEffect(() => {
    StorageService.setPaymentMode(paymentMode)
  }, [paymentMode])

  useEffect(() => {
    StorageService.setSinglePayer(singlePayer)
  }, [singlePayer])

  // People methods
  const addPerson = (newPerson) => {
    try {
      if (Array.isArray(newPerson)) {
        // Filter only unique names and find duplicates
        const duplicates = newPerson.filter(newP => 
          people.some(p => p.name.toLowerCase() === newP.name.toLowerCase())
        ).map(p => p.name)

        const uniqueNames = newPerson.filter(newP => 
          !people.some(p => p.name.toLowerCase() === newP.name.toLowerCase())
        )

        uniqueNames.forEach(person => validatePerson(person))

        // Add only unique names
        if (uniqueNames.length > 0) {
          setPeople(prev => [...prev, ...uniqueNames])
          
          // Show success notification
          if (uniqueNames.length === 1) {
            toast.success(`Участник ${uniqueNames[0].name} добавлен`)
          } else {
            toast.success(`Добавлено ${uniqueNames.length} участников`)
          }
        }

        // If there were duplicates, show warning
        if (duplicates.length > 0) {
          toast.error(`${duplicates.join(', ')} уже в списке`)
        }
      } else {
        validatePerson(newPerson)
        setPeople(prev => [...prev, newPerson])
        toast.success(`Участник ${newPerson.name} добавлен`)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const removePerson = (personId) => {
    const personToRemove = people.find(person => person.id === personId)
    const updatedPeople = people.filter(person => person.id !== personId)
    setPeople(updatedPeople)
    
    // If removed the last person, clear all costs
    if (updatedPeople.length === 0) {
      setCosts([])
      toast.success('Все данные очищены')
    } else {
      // Otherwise just filter costs, removing the deleted person
      setCosts(prevCosts => prevCosts.map(cost => ({
        ...cost,
        paidBy: cost.paidBy.filter(p => p.id !== personId),
        splitBetween: cost.splitBetween.filter(p => p.id !== personId)
      })))
      toast.success(`Участник ${personToRemove.name} удален`)
    }
  }

  // Costs methods
  const addCost = (newCost) => {
    try {
      if (Array.isArray(newCost)) {
        setPendingCosts(newCost)
        setIsPayerModalOpen(true)
      } else {
        validateCost(newCost)
        setCosts(prev => [...prev, newCost])
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const updateCost = (costId, updatedCost) => {
    try {
      validateCost(updatedCost)
      if (updatedCost.id !== costId) {
        // This is a duplicate operation
        setCosts(prevCosts => {
          const index = prevCosts.findIndex(cost => cost.id === costId)
          const newCosts = [...prevCosts]
          newCosts.splice(index + 1, 0, updatedCost)
          return newCosts
        })
        toast.success('Позиция успешно дублирована')
      } else {
        // This is a regular update operation
        setCosts(prev => prev.map(cost => 
          cost.id === costId ? updatedCost : cost
        ))
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCost = (costId) => {
    setCosts(prev => prev.filter(cost => cost.id !== costId))
  }

  // Payment mode methods
  const changePaymentMode = (mode) => {
    if (mode === paymentMode) return

    if (mode === 'single') {
      // Сохраняем текущее состояние расходов для ручного режима
      setManualModeCosts(costs)
      
      // Устанавливаем единого плательщика для всех расходов
      if (singlePayer) {
        setCosts(prev => prev.map(cost => ({
          ...cost,
          paidBy: [singlePayer]
        })))
      }
    } else if (mode === 'manual') {
      setSinglePayer(null)
      // Восстанавливаем сохраненное состояние расходов для ручного режима
      if (manualModeCosts.length > 0) {
        setCosts(manualModeCosts)
      }
    }

    setPaymentMode(mode)
  }

  const selectSinglePayer = (person) => {
    setSinglePayer(person)
    setCosts(prev => prev.map(cost => ({
      ...cost,
      paidBy: [person]
    })))
  }

  // Computed values
  const showCostSection = people.length > 0

  const showTransferSection = useMemo(() => {
    return costs.some(cost => 
      cost.paidBy.length > 0 && cost.splitBetween.length > 0
    )
  }, [costs])

  const value = {
    // State
    user,
    people,
    costs,
    paymentMode,
    singlePayer,
    transfers,
    isCalculating,
    isPayerModalOpen,
    pendingCosts,
    showCostSection,
    showTransferSection,
    isModalOpen,

    // Setters
    setUser,
    setTransfers,
    setIsCalculating,
    setIsPayerModalOpen,
    setPendingCosts,
    setIsModalOpen,

    // Methods
    addPerson,
    removePerson,
    addCost,
    updateCost,
    deleteCost,
    changePaymentMode,
    selectSinglePayer,
    logout: () => {
      authService.logout()
      setUser(null)
    }
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