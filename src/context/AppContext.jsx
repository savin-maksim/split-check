import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { StorageService } from '../services/storage'
import { validatePerson, validateCost } from '../utils/validation'
import { toast } from 'react-hot-toast'

const AppContext = createContext()

function newSessionId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `check-${Date.now()}`
}

function defaultLegacyCheckTitle() {
  return `Чек от ${new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`
}

export function AppProvider({ children }) {
  const [people, setPeople] = useState(() => StorageService.getPeople())
  const [costs, setCosts] = useState(() => StorageService.getCosts())
  const [paymentMode, setPaymentMode] = useState(() => StorageService.getPaymentMode())
  const [singlePayer, setSinglePayer] = useState(() => StorageService.getSinglePayer())
  const [manualModeCosts, setManualModeCosts] = useState([]) // Сохраняем состояние расходов для ручного режима
  const [isPayerModalOpen, setIsPayerModalOpen] = useState(false)
  const [pendingCosts, setPendingCosts] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(null) // 'addPerson', 'addCost', null
  const [sessionMeta, setSessionMeta] = useState(() => StorageService.getSessionMeta())
  const [newCheckModalNonce, setNewCheckModalNonce] = useState(0)
  const [savedChecks, setSavedChecks] = useState(() => StorageService.getSavedChecks())
  const [statisticsShareModalOpen, setStatisticsShareModalOpen] = useState(false)

  // Save to localStorage when data changes
  useEffect(() => {
    StorageService.setSessionMeta(sessionMeta)
  }, [sessionMeta])

  /**
   * Есть участники/расходы, но нет meta (старые данные или зашли на /people без «Новый чек») —
   * создаём meta, чтобы автосохранение в список чеков работало.
   */
  useEffect(() => {
    if (sessionMeta != null) return
    if (people.length === 0 && costs.length === 0) return
    setSessionMeta({ id: newSessionId(), title: defaultLegacyCheckTitle() })
  }, [sessionMeta, people, costs])

  /** Текущий чек всегда отражён в списке чеков. */
  useEffect(() => {
    if (!sessionMeta?.id) return
    const existing = StorageService.getSavedChecks()
    const idx = existing.findIndex((c) => c.id === sessionMeta.id)
    const createdAt = idx >= 0 ? existing[idx].createdAt : Date.now()
    const snapshot = {
      id: sessionMeta.id,
      title: sessionMeta.title?.trim() || 'Без названия',
      createdAt,
      people: JSON.parse(JSON.stringify(people)),
      costs: JSON.parse(JSON.stringify(costs)),
      paymentMode,
      singlePayer: singlePayer ? JSON.parse(JSON.stringify(singlePayer)) : null,
    }
    const next = idx >= 0 ? existing.map((c, i) => (i === idx ? snapshot : c)) : [snapshot, ...existing]
    StorageService.setSavedChecks(next)
    setSavedChecks(next)
  }, [sessionMeta, people, costs, paymentMode, singlePayer])

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
  const addPerson = useCallback(
    (newPerson) => {
      try {
        if (Array.isArray(newPerson)) {
          // Filter only unique names and find duplicates
          const duplicates = newPerson
            .filter((newP) => people.some((p) => p.name.toLowerCase() === newP.name.toLowerCase()))
            .map((p) => p.name)

          const uniqueNames = newPerson.filter(
            (newP) => !people.some((p) => p.name.toLowerCase() === newP.name.toLowerCase()),
          )

          uniqueNames.forEach((person) => validatePerson(person))

          // Add only unique names
          if (uniqueNames.length > 0) {
            setPeople((prev) => [...prev, ...uniqueNames])

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
          setPeople((prev) => [...prev, newPerson])
          toast.success(`Участник ${newPerson.name} добавлен`)
        }
      } catch (error) {
        toast.error(error.message)
      }
    },
    [people],
  )

  const removeAllPeople = useCallback(() => {
    setPeople([])
    setCosts([])
    setSinglePayer(null)
    setManualModeCosts([])
    toast.success('Все участники и расходы удалены')
  }, [])

  const updatePerson = useCallback(
    (personId, rawName) => {
      try {
        const trimmed = rawName.trim()
        const name = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
        validatePerson({ name })

        const duplicate = people.some((p) => p.id !== personId && p.name.toLowerCase() === name.toLowerCase())
        if (duplicate) {
          toast.error('Участник с таким именем уже есть')
          return false
        }

        const prev = people.find((p) => p.id === personId)
        if (!prev) return false

        if (prev.name === name) {
          return true
        }

        const updatedPerson = { id: personId, name }

        setPeople((list) => list.map((p) => (p.id === personId ? updatedPerson : p)))

        setCosts((prevCosts) =>
          prevCosts.map((cost) => ({
            ...cost,
            paidBy: (cost.paidBy || []).map((p) => (p.id === personId ? updatedPerson : p)),
            splitBetween: (cost.splitBetween || []).map((p) => (p.id === personId ? updatedPerson : p)),
          })),
        )

        setSinglePayer((p) => (p?.id === personId ? updatedPerson : p))

        setManualModeCosts((prev) =>
          prev.map((cost) => ({
            ...cost,
            paidBy: (cost.paidBy || []).map((p) => (p.id === personId ? updatedPerson : p)),
            splitBetween: (cost.splitBetween || []).map((p) => (p.id === personId ? updatedPerson : p)),
          })),
        )

        toast.success('Имя обновлено')
        return true
      } catch (error) {
        toast.error(error.message)
        return false
      }
    },
    [people],
  )

  const removePerson = useCallback(
    (personId) => {
      const personToRemove = people.find((person) => person.id === personId)
      const updatedPeople = people.filter((person) => person.id !== personId)
      setPeople(updatedPeople)

      // If removed the last person, clear all costs
      if (updatedPeople.length === 0) {
        setCosts([])
        toast.success('Все данные очищены')
      } else {
        // Otherwise just filter costs, removing the deleted person
        setCosts((prevCosts) =>
          prevCosts.map((cost) => {
            const weights = cost.weights
            const nextWeights =
              weights && typeof weights === 'object'
                ? Object.fromEntries(Object.entries(weights).filter(([key]) => String(key) !== String(personId)))
                : weights
            return {
              ...cost,
              paidBy: cost.paidBy.filter((p) => p.id !== personId),
              splitBetween: cost.splitBetween.filter((p) => p.id !== personId),
              ...(nextWeights !== undefined ? { weights: nextWeights } : {}),
            }
          }),
        )
        toast.success(`Участник ${personToRemove.name} удален`)
      }
    },
    [people],
  )

  // Costs methods
  const addCost = useCallback((newCost) => {
    try {
      if (Array.isArray(newCost)) {
        setPendingCosts(newCost)
        setIsPayerModalOpen(true)
      } else {
        validateCost(newCost)
        setCosts((prev) => [...prev, newCost])
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  const addCosts = useCallback((newCosts) => {
    try {
      setCosts((prev) => [...prev, ...newCosts])
      toast.success(`Добавлено ${newCosts.length} позиций`)
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  const updateCost = useCallback((costId, updatedCost) => {
    try {
      validateCost(updatedCost)
      setCosts((prev) => prev.map((cost) => (cost.id === costId ? updatedCost : cost)))
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  const duplicateCost = useCallback((originalCostId, newCost) => {
    try {
      validateCost(newCost)
      setCosts((prevCosts) => {
        const index = prevCosts.findIndex((cost) => cost.id === originalCostId)
        const newCosts = [...prevCosts]
        if (index !== -1) {
          newCosts.splice(index + 1, 0, newCost)
        } else {
          newCosts.push(newCost)
        }
        return newCosts
      })
      toast.success('Позиция успешно дублирована')
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  const deleteCost = useCallback((costId) => {
    setCosts((prev) => prev.filter((cost) => cost.id !== costId))
  }, [])

  const removeAllCosts = useCallback(() => {
    setCosts([])
    setManualModeCosts([])
    setPendingCosts(null)
    StorageService.clearStatsCache()
    toast.success('Все позиции удалены')
  }, [])

  // Payment mode methods
  const changePaymentMode = useCallback(
    (mode) => {
      if (mode === paymentMode) return

      if (mode === 'single') {
        // Сохраняем текущее состояние расходов для ручного режима
        setManualModeCosts(costs)

        // Устанавливаем единого плательщика для всех расходов
        if (singlePayer) {
          setCosts((prev) =>
            prev.map((cost) => ({
              ...cost,
              paidBy: [singlePayer],
            })),
          )
        }
      } else if (mode === 'manual') {
        setSinglePayer(null)
        // Восстанавливаем сохраненное состояние расходов для ручного режима
        if (manualModeCosts.length > 0) {
          setCosts(manualModeCosts)
        }
      }

      setPaymentMode(mode)
    },
    [paymentMode, costs, manualModeCosts, singlePayer],
  )

  const selectSinglePayer = useCallback((person) => {
    setSinglePayer(person)
    setCosts((prev) =>
      prev.map((cost) => ({
        ...cost,
        paidBy: [person],
      })),
    )
  }, [])

  /** Новый чек: пустая сессия, новый id, название. Вызывающий код делает navigate('/people'). */
  const startNewCheck = useCallback((title) => {
    const trimmed = title.trim()
    if (!trimmed) return false
    const id = newSessionId()
    setPeople([])
    setCosts([])
    setSinglePayer(null)
    setManualModeCosts([])
    setPaymentMode('manual')
    setPendingCosts(null)
    setIsPayerModalOpen(false)
    setIsModalOpen(null)
    setSessionMeta({ id, title: trimmed })
    StorageService.clearStatsCache()
    return true
  }, [])

  const triggerNewCheckModal = useCallback(() => {
    setNewCheckModalNonce((n) => n + 1)
  }, [])

  const deleteSavedCheck = useCallback(
    (id) => {
      const next = StorageService.getSavedChecks().filter((c) => c.id !== id)
      StorageService.setSavedChecks(next)
      setSavedChecks(next)
      if (sessionMeta?.id === id) {
        setSessionMeta(null)
        setPeople([])
        setCosts([])
        setSinglePayer(null)
        setManualModeCosts([])
        setPaymentMode('manual')
        setPendingCosts(null)
        setIsPayerModalOpen(false)
        setIsModalOpen(null)
        StorageService.clearStatsCache()
      }
    },
    [sessionMeta],
  )

  const updateSavedCheckTitle = useCallback((id, title) => {
    const existing = StorageService.getSavedChecks()
    const idx = existing.findIndex((c) => c.id === id)
    if (idx < 0) return
    const trimmed = title.trim() || 'Без названия'
    const next = existing.map((c, i) => (i === idx ? { ...c, title: trimmed } : c))
    StorageService.setSavedChecks(next)
    setSavedChecks(next)
  }, [])

  /** Полная подстановка сессии (например, загрузка сохранённого чека). Статистика пересчитается по данным. */
  const applySessionSnapshot = useCallback((snapshot) => {
    setPeople(Array.isArray(snapshot.people) ? snapshot.people : [])
    setCosts(Array.isArray(snapshot.costs) ? snapshot.costs : [])
    setPaymentMode(snapshot.paymentMode === 'single' ? 'single' : 'manual')
    setSinglePayer(snapshot.singlePayer ?? null)
    setManualModeCosts([])
    setPendingCosts(null)
    setIsPayerModalOpen(false)
    setIsModalOpen(null)
    const sid = typeof snapshot.id === 'string' && snapshot.id ? snapshot.id : newSessionId()
    const stitle = typeof snapshot.title === 'string' && snapshot.title.trim() ? snapshot.title.trim() : 'Без названия'
    setSessionMeta({ id: sid, title: stitle })
    StorageService.clearStatsCache()
  }, [])

  // Computed values
  const showCostSection = people.length > 0

  const showTransferSection = useMemo(() => {
    return costs.some((cost) => {
      if (!cost.paidBy?.length) return false
      if (cost.distributionType === 'weighted') {
        const total = Object.values(cost.weights || {}).reduce((s, u) => s + Math.max(0, Math.floor(Number(u) || 0)), 0)
        return total > 0
      }
      return cost.splitBetween?.length > 0
    })
  }, [costs])

  const value = useMemo(
    () => ({
      // State
      people,
      costs,
      paymentMode,
      singlePayer,
      isPayerModalOpen,
      pendingCosts,
      showCostSection,
      showTransferSection,
      isModalOpen,
      sessionMeta,
      setSessionMeta,
      newCheckModalNonce,
      savedChecks,
      statisticsShareModalOpen,
      setStatisticsShareModalOpen,

      // Setters
      setIsPayerModalOpen,
      setPendingCosts,
      setIsModalOpen,

      // Methods
      addPerson,
      removePerson,
      removeAllPeople,
      updatePerson,
      addCost,
      addCosts,
      updateCost,
      duplicateCost,
      deleteCost,
      removeAllCosts,
      changePaymentMode,
      selectSinglePayer,
      applySessionSnapshot,
      startNewCheck,
      triggerNewCheckModal,
      deleteSavedCheck,
      updateSavedCheckTitle,
    }),
    [
      people,
      costs,
      paymentMode,
      singlePayer,
      isPayerModalOpen,
      pendingCosts,
      showCostSection,
      showTransferSection,
      isModalOpen,
      sessionMeta,
      setSessionMeta,
      newCheckModalNonce,
      savedChecks,
      statisticsShareModalOpen,
      setStatisticsShareModalOpen,
      addPerson,
      removePerson,
      removeAllPeople,
      updatePerson,
      addCost,
      addCosts,
      updateCost,
      duplicateCost,
      deleteCost,
      removeAllCosts,
      changePaymentMode,
      selectSinglePayer,
      applySessionSnapshot,
      startNewCheck,
      triggerNewCheckModal,
      deleteSavedCheck,
      updateSavedCheckTitle,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
