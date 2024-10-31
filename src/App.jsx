import { useState, useMemo } from 'react'
import Section from './components/Section/Section'
import Header from './layout/Header/Header'
import PeopleSection from './layout/PeopleSection/PeopleSection'
import CostSection from './layout/CostSection/CostSection'
import TransferSection from './layout/TransferSection/TransferSection'
import Toast from './components/Toast/Toast'
import StatisticsSection from './layout/StatisticsSection/StatisticsSection'

function App() {
  const [people, setPeople] = useState([])
  const [costs, setCosts] = useState([])
  const [paymentMode, setPaymentMode] = useState('manual')
  const [singlePayer, setSinglePayer] = useState(null)
  const [previousPayersState, setPreviousPayersState] = useState(null)

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
      setPeople([...people, ...newPerson])
    } else {
      setPeople([...people, newPerson])
    }
  }

  const handleRemovePerson = (personId) => {
    const updatedPeople = people.filter(person => person.id !== personId)
    setPeople(updatedPeople)
    
    // Если удалили последнего человека, очищаем все расходы
    if (updatedPeople.length === 0) {
      setCosts([])
    } else {
      // Иначе просто фильтруем расходы, убирая удаленного человека
      setCosts(costs.map(cost => ({
        ...cost,
        paidBy: cost.paidBy.filter(p => p.id !== personId),
        splitBetween: cost.splitBetween.filter(p => p.id !== personId)
      })))
    }
  }

  const handleAddCost = (newCost) => {
    if (paymentMode === 'single' && singlePayer) {
      newCost.paidBy = [singlePayer]
    }
    setCosts([...costs, newCost])
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
    if (mode === 'single') {
      setPreviousPayersState(costs.map(cost => ({
        id: cost.id,
        paidBy: [...cost.paidBy]
      })))
    } else {
      if (previousPayersState) {
        setCosts(costs.map(cost => {
          const previousState = previousPayersState.find(p => p.id === cost.id)
          return {
            ...cost,
            paidBy: previousState ? previousState.paidBy : []
          }
        }))
      }
      setSinglePayer(null)
    }
    setPaymentMode(mode)
  }

  const handleSinglePayerSelect = (person) => {
    setSinglePayer(person)
    setCosts(costs.map(cost => ({
      ...cost,
      paidBy: [person]
    })))
  }

  return (
    <>
      <Header />
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
              />
            </Section>
            <Section>
              <StatisticsSection 
                people={people}
                costs={costs}
                paymentMode={paymentMode}
              />
            </Section>
          </>
        )}
      </main>
      <Toast />
    </>
  )
}

export default App
