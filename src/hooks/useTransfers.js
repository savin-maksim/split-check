import { useState, useEffect, useCallback } from 'react'
import { 
  initializeDebtsMatrix, 
  updateDebtsForCost, 
  calculateBalances,
  separateBalances,
  generateOptimalTransfers
} from '../utils/calculations'

export function useTransfers(people, costs) {
  const [transfers, setTransfers] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateTransfers = useCallback(() => {
    if (!people?.length || !costs?.length) {
      setTransfers([])
      return
    }

    // Initialize debts matrix
    const debts = initializeDebtsMatrix(people)

    // Update debts for each cost
    costs.forEach(cost => updateDebtsForCost(debts, cost))

    // Calculate balances
    const balances = calculateBalances(debts, people)

    // Separate positive and negative balances
    const { positiveBalances, negativeBalances } = separateBalances(balances)

    // Generate optimal transfers
    const optimizedTransfers = generateOptimalTransfers(positiveBalances, negativeBalances)

    setTransfers(optimizedTransfers)
  }, [people, costs])

  useEffect(() => {
    setIsCalculating(true)
    const timer = setTimeout(() => {
      calculateTransfers()
      setIsCalculating(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [calculateTransfers])

  return { transfers, isCalculating }
} 