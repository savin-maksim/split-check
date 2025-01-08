import { useState, useEffect, useRef } from 'react'
import TransferCard from '../../components/Cards/Transfer/TransferCard'
import { 
  initializeDebtsMatrix, 
  updateDebtsForCost, 
  calculateBalances,
  separateBalances,
  generateOptimalTransfers
} from '../../utils/calculations'

import './transfer-section.scss'

function TransferSection({ 
  costs, 
  people, 
  isLoading, 
  transfers: externalTransfers,
  onTransfersCalculated 
}) {
  const [internalTransfers, setInternalTransfers] = useState([])
  const calculationTimerRef = useRef(null)

  // Use external transfers if provided, otherwise use internal
  const transfers = externalTransfers || internalTransfers

  useEffect(() => {
    // Only calculate if we're using internal state
    if (!externalTransfers) {
      // Clear previous timer if exists
      if (calculationTimerRef.current) {
        clearTimeout(calculationTimerRef.current)
      }

      // Set new timer
      calculationTimerRef.current = setTimeout(() => {
        calculateTransfers()
      }, 2000)

      // Cleanup on unmount or deps change
      return () => {
        if (calculationTimerRef.current) {
          clearTimeout(calculationTimerRef.current)
        }
      }
    }
  }, [costs, people, externalTransfers])

  const calculateTransfers = () => {
    if (!people?.length || !costs?.length) {
      const emptyTransfers = []
      setInternalTransfers(emptyTransfers)
      onTransfersCalculated?.(emptyTransfers)
      return
    }

    // Initialize debts matrix
    const debts = initializeDebtsMatrix(people)
    
    // Calculate debts for each cost
    costs.forEach(cost => {
      if (cost.paidBy.length && cost.splitBetween.length) {
        updateDebtsForCost(debts, cost)
      }
    })

    // Calculate balances
    const balances = calculateBalances(debts, people)

    // Sort positive and negative balances
    const { positiveBalances, negativeBalances } = separateBalances(balances)

    // Calculate optimized transfers
    const optimizedTransfers = generateOptimalTransfers(positiveBalances, negativeBalances)

    setInternalTransfers(optimizedTransfers)
    onTransfersCalculated?.(optimizedTransfers)
  }

  return (
    <div className="transfer-section">
      <div className="transfer-section__cards">
        <TransferCard transfers={transfers} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default TransferSection 