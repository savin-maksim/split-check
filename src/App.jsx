import { useState, useEffect, useMemo } from 'react'
import Header from './layout/Header/Header'
import Section from './components/Section/Section'
import PeopleSection from './layout/PeopleSection/PeopleSection'
import CostSection from './layout/CostSection/CostSection'
import TransferSection from './layout/TransferSection/TransferSection'
import StatisticsSection from './layout/StatisticsSection/StatisticsSection'
import Toast from './components/Toast/Toast'
import { toast } from 'react-hot-toast'

// Define storage keys
const STORAGE_KEYS = {
  PEOPLE: 'splitcheck_people',
  COSTS: 'splitcheck_costs',
  PAYMENT_MODE: 'splitcheck_payment_mode',
  SINGLE_PAYER: 'splitcheck_single_payer'
}

// Functions for URL handling
const compressData = (data) => {
  try {
    const minimizedData = Array.isArray(data) 
      ? data.map(item => {
          if (item.hasOwnProperty('id') && item.hasOwnProperty('name')) {
            return [item.id, item.name]
          } else if (item.hasOwnProperty('id') && item.hasOwnProperty('title')) {
            return [
              item.id,
              item.title,
              item.amount,
              item.paidBy.map(p => p.id),
              item.splitBetween.map(p => p.id)
            ]
          }
          return item
        })
      : data

    const jsonString = JSON.stringify(minimizedData)
    return btoa(encodeURIComponent(jsonString))
  } catch (error) {
    console.error('Error compressing data:', error)
    return null
  }
}

const decompressData = (compressed, type = 'general') => {
  try {
    const jsonString = decodeURIComponent(atob(compressed))
    const data = JSON.parse(jsonString)

    if (Array.isArray(data)) {
      return data.map(item => {
        if (Array.isArray(item)) {
          if (item.length === 2) {
            return { id: item[0], name: item[1] }
          } else if (item.length === 5) {
            return {
              id: item[0],
              title: item[1],
              amount: item[2],
              paidBy: item[3].map(id => ({ id })),
              splitBetween: item[4].map(id => ({ id }))
            }
          }
        }
        return item
      })
    }
    return data
  } catch (error) {
    console.error('Error decompressing data:', error)
    return null
  }
}

function App() {
  // Функция для получения начальных данных из URL или localStorage
  const getInitialData = (storageKey, urlParam, type = 'general') => {
    // Сначала проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search)
    const urlData = urlParams.get(urlParam)
    
    if (urlData) {
      const decompressed = decompressData(urlData)
      if (decompressed) {
        return decompressed
      }
    }
    
    // Если в URL нет данных, берем из localStorage
    const savedData = localStorage.getItem(storageKey)
    return savedData ? JSON.parse(savedData) : []
  }

  // Сначала инициализируем people
  const [people, setPeople] = useState(() => getInitialData(STORAGE_KEYS.PEOPLE, 'p'))

  // Затем инициализируем costs, используя уже загруженных people
  const [costs, setCosts] = useState(() => {
    const initialCosts = getInitialData(STORAGE_KEYS.COSTS, 'c')
    return initialCosts.map(cost => ({
      ...cost,
      // Находим полные объекты людей по их ID
      paidBy: cost.paidBy.map(p => 
        people.find(person => person.id === p.id) || p
      ),
      splitBetween: cost.splitBetween.map(p => 
        people.find(person => person.id === p.id) || p
      )
    }))
  })

  const [paymentMode, setPaymentMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('m') || localStorage.getItem(STORAGE_KEYS.PAYMENT_MODE) || 'manual'
  })

  const [singlePayer, setSinglePayer] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlData = urlParams.get('s')
    if (urlData) {
      const decompressed = decompressData(urlData)
      if (decompressed && decompressed[0]) {
        return people.find(p => p.id === decompressed[0]) || null
      }
    }
    const savedPayer = localStorage.getItem(STORAGE_KEYS.SINGLE_PAYER)
    return savedPayer ? JSON.parse(savedPayer) : null
  })

  const [previousPayersState, setPreviousPayersState] = useState(null)
  const [recalculationTimer, setRecalculationTimer] = useState(null)
  const [transfers, setTransfers] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)

  // Add new state for payer selection modal
  const [isPayerModalOpen, setIsPayerModalOpen] = useState(false)
  const [pendingCosts, setPendingCosts] = useState(null)

  // Update URL when data changes
  useEffect(() => {
    const updateURL = () => {
      const params = new URLSearchParams()
      
      if (people.length > 0) {
        const peopleWithNames = people.map(p => [p.id, p.name])
        params.set('p', compressData(peopleWithNames))
      }
      
      if (costs.length > 0) {
        const minimizedCosts = costs.map(cost => [
          cost.id,
          cost.title,
          cost.amount,
          cost.paidBy.map(p => p.id),
          cost.splitBetween.map(p => p.id)
        ])
        params.set('c', compressData(minimizedCosts))
      }

      if (paymentMode !== 'manual') params.set('m', paymentMode)
      if (singlePayer) params.set('s', compressData([singlePayer.id]))

      const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
      window.history.replaceState({}, '', newURL)
    }

    updateURL()
  }, [people, costs, paymentMode, singlePayer])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people))
  }, [people])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COSTS, JSON.stringify(costs))
  }, [costs])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_MODE, paymentMode)
  }, [paymentMode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SINGLE_PAYER, JSON.stringify(singlePayer))
  }, [singlePayer])

  // Add function to copy the link
  const handleShareLink = () => {
    const currentURL = window.location.href
    navigator.clipboard.writeText(currentURL)
      .then(() => toast.success('Link copied'))
      .catch(() => toast.error('Failed to copy link'))
  }

  // Show cost section when there's at least one person
  const showCostSection = people.length > 0

  // Show transfer section when there's at least one cost with both payer and split
  const showTransferSection = useMemo(() => {
    return costs.some(cost => 
      cost.paidBy.length > 0 && cost.splitBetween.length > 0
    )
  }, [costs])

  const handleAddPerson = (newPerson) => {
    if (Array.isArray(newPerson)) {
      // Фильтруем только уникальные имена и находим дубликаты
      const duplicates = newPerson.filter(newP => 
        people.some(p => p.name.toLowerCase() === newP.name.toLowerCase())
      ).map(p => p.name)

      const uniqueNames = newPerson.filter(newP => 
        !people.some(p => p.name.toLowerCase() === newP.name.toLowerCase())
      )

      // Добавляем только уникальные имена
      if (uniqueNames.length > 0) {
        setPeople([...people, ...uniqueNames])
        
        // Показываем уведомление об успешном добавлении
        if (uniqueNames.length === 1) {
          toast.success(`Участник ${uniqueNames[0].name} добавлен`)
        } else {
          toast.success(`Добавлено ${uniqueNames.length} участников`)
        }
      }

      // Если были дубликаты, показываем предупреждение
      if (duplicates.length > 0) {
        toast.error(`${duplicates.join(', ')} уже в списке`)
      }
    } else {
      setPeople([...people, newPerson])
      toast.success(`Участник ${newPerson.name} добавлен`)
    }
  }

  const handleRemovePerson = (personId) => {
    const personToRemove = people.find(person => person.id === personId)
    const updatedPeople = people.filter(person => person.id !== personId)
    setPeople(updatedPeople)
    
    // Если удалили последнего человека, очищаем все расходы
    if (updatedPeople.length === 0) {
      setCosts([])
      toast.success('Все данные очищены')
    } else {
      // Иначе просто фильтруем расходы, убирая удаленного человека
      setCosts(costs.map(cost => ({
        ...cost,
        paidBy: cost.paidBy.filter(p => p.id !== personId),
        splitBetween: cost.splitBetween.filter(p => p.id !== personId)
      })))
      toast.success(`Участник ${personToRemove.name} удален`)
    }
  }

  const handleAddCost = (newCost) => {
    // Если передан массив расходов (при импорте)
    if (Array.isArray(newCost)) {
      // Сохраняем расходы во временное состояние и показываем модальное окно
      setPendingCosts(newCost)
      setIsPayerModalOpen(true)
    } else {
      // Обычное добавление одного расхода
      const costToAdd = {
        ...newCost,
        id: Math.random().toString(36).substr(2, 9),
        paidBy: paymentMode === 'single' && singlePayer ? [singlePayer] : [],
        splitBetween: []
      }
      setCosts(prevCosts => [...prevCosts, costToAdd])
    }
  }

  const handlePayerSelect = (selectedPayer) => {
    if (pendingCosts) {
      // Преобразуем каждый расход, добавляя выбранного плательщика
      const costsToAdd = pendingCosts.map(cost => ({
        id: Math.random().toString(36).substr(2, 9), // Добавляем уникальный ID
        title: cost.title,
        amount: parseFloat(cost.amount),
        paidBy: [selectedPayer], // Устанавливаем выбранного плательщика
        splitBetween: [] // Пустой массив для разделения
      }))

      if (paymentMode === 'single') {
        setCosts(prevCosts => [...prevCosts, ...costsToAdd])
        setPendingCosts(null)
        
        // Показываем уведомление об успешном импорте
        toast.success(`Расходы добавлены, плательщик: ${selectedPayer.name}`)
      }
      setIsPayerModalOpen(false)
    }
  }

  const handleUpdateCost = (costId, updatedCost) => {
    setCosts(costs.map(cost => 
      cost.id === costId ? updatedCost : cost
    ))
  }

  const handleDeleteCost = (costId) => {
    setCosts(costs.filter(cost => cost.id !== costId))
  }

  const handlePaymentModeChange = (mode) => {
    if (mode === paymentMode) return

    if (mode === 'single') {
      // Сохраняем текущее состояние плательщиков
      setPreviousPayersState(costs.map(cost => ({
        id: cost.id,
        paidBy: [...cost.paidBy]
      })))

      // Обновляем все расходы, устанавливая одного плательщика
      if (singlePayer) {
        setCosts(costs.map(cost => ({
          ...cost,
          paidBy: [singlePayer]
        })))
      }
    } else if (mode === 'manual' && previousPayersState) {
      // Восстанавливаем предыдущее состояние плательщиков
      setCosts(costs.map(cost => {
        const previousState = previousPayersState.find(prev => prev.id === cost.id)
        return {
          ...cost,
          paidBy: previousState ? previousState.paidBy : cost.paidBy
        }
      }))
      setPreviousPayersState(null)
    }

    setPaymentMode(mode)
    setSinglePayer(null)
  }

  const handleSinglePayerSelect = (person) => {
    setSinglePayer(person)
    setCosts(costs.map(cost => ({
      ...cost,
      paidBy: [person]
    })))
  }

  // Определяем, когда показывать кнопку шеринга
  const showShareButton = useMemo(() => {
    return costs.some(cost => 
      cost.paidBy.length > 0 && 
      cost.splitBetween.length > 0
    ) && people.length > 0
  }, [costs, people])

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      if (recalculationTimer) {
        clearTimeout(recalculationTimer)
      }
    }
  }, [recalculationTimer])

  const handleTransfersCalculated = (newTransfers) => {
    setTransfers(newTransfers)
  }

  // Update the handler for transfers and statistics calculations
  const handlePersonInteraction = () => {
    setIsCalculating(true)
    if (recalculationTimer) {
      clearTimeout(recalculationTimer)
    }
    
    const timer = setTimeout(() => {
      setIsCalculating(false)
    }, 2000)
    
    setRecalculationTimer(timer)
  }

  // Добавьте этот эффект для отслеживания изменений в costs
  useEffect(() => {
    handlePersonInteraction()
  }, [costs])

  return (
    <>
      <Header 
        onShare={showShareButton ? handleShareLink : null}
      />
      <main className="content">
        <Section>
          <PeopleSection 
            people={people}
            onAddPerson={handleAddPerson}
            onRemovePerson={handleRemovePerson}
          />
        </Section>

        {showCostSection && (
          <Section>
            <CostSection 
              people={people}
              costs={costs}
              paymentMode={paymentMode}
              singlePayer={singlePayer}
              onAddCost={handleAddCost}
              onUpdateCost={handleUpdateCost}
              onDeleteCost={handleDeleteCost}
              onPaymentModeChange={handlePaymentModeChange}
              onSinglePayerSelect={handleSinglePayerSelect}
            />
          </Section>
        )}

        {showTransferSection && (
          <>
            <Section>
              <TransferSection 
                people={people}
                costs={costs}
                isLoading={isCalculating}
                onTransfersCalculated={handleTransfersCalculated}
              />
            </Section>
            <Section>
              <StatisticsSection 
                people={people}
                costs={costs}
                paymentMode={paymentMode}
                transfers={transfers}
                isCalculating={isCalculating}
              />
            </Section>
          </>
        )}
      </main>
      <Toast />
      <SelectPayerModal
        isOpen={isPayerModalOpen}
        onClose={() => {
          setIsPayerModalOpen(false)
          setPendingCosts(null)
        }}
        onSubmit={handlePayerSelect}
        people={people}
        title="Выбор плательщика"
      />
    </>
  )
}

export default App
