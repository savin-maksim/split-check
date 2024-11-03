import { useState, useEffect, useRef } from 'react'
import TransferCard from '../../components/Cards/Transfer/TransferCard'

import './transfer-section.scss'

function TransferSection({ costs, people, onTransfersCalculated, isLoading }) {
  const [transfers, setTransfers] = useState([])
  const calculationTimerRef = useRef(null)

  useEffect(() => {
    // Очищаем предыдущий таймер если он есть
    if (calculationTimerRef.current) {
      clearTimeout(calculationTimerRef.current)
    }

    // Устанавливаем новый таймер
    calculationTimerRef.current = setTimeout(() => {
      calculateTransfers()
    }, 2000)

    // Очистка при размонтировании или изменении зависимостей
    return () => {
      if (calculationTimerRef.current) {
        clearTimeout(calculationTimerRef.current)
      }
    }
  }, [costs, people]) // Зависимости useEffect

  const calculateTransfers = () => {
    let debts = {}
    
    // Initialize debts
    people.forEach(person1 => {
      debts[person1.name] = {}
      people.forEach(person2 => {
        if (person1.id !== person2.id) {
          debts[person1.name][person2.name] = 0
        }
      })
    })

    // Calculate debts for each cost
    costs.forEach(cost => {
      if (cost.paidBy.length && cost.splitBetween.length) {
        const amountPerPerson = cost.amount / cost.splitBetween.length
        const payer = cost.paidBy[0].name

        cost.splitBetween.forEach(person => {
          if (person.name !== payer) {
            debts[person.name][payer] += amountPerPerson
          }
        })
      }
    })

    // Calculate balances for each person
    const balances = {}
    people.forEach(person => {
      balances[person.name] = 0
      Object.keys(debts).forEach(debtor => {
        if (debts[debtor][person.name]) {
          balances[person.name] += debts[debtor][person.name]
        }
        if (debts[person.name][debtor]) {
          balances[person.name] -= debts[person.name][debtor]
        }
      })
    })


    // Sort positive and negative balances
    const positiveBalances = Object.entries(balances)
      .filter(([_, balance]) => balance > 0)
      .sort(([, a], [, b]) => b - a)
    
    const negativeBalances = Object.entries(balances)
      .filter(([_, balance]) => balance < 0)
      .sort(([, a], [, b]) => a - b)


    // Calculate optimized transfers
    const optimizedTransfers = []
    let positiveIndex = 0
    let negativeIndex = 0

    while (positiveIndex < positiveBalances.length && negativeIndex < negativeBalances.length) {
      const [creditorName, creditorBalance] = positiveBalances[positiveIndex]
      const [debtorName, debtorBalance] = negativeBalances[negativeIndex]

      const transferAmount = Math.min(creditorBalance, Math.abs(debtorBalance))
      
      if (transferAmount > 0) {
        optimizedTransfers.push({
          from: debtorName,
          to: creditorName,
          amount: Math.round(transferAmount * 100) / 100
        })

        // Update balances
        positiveBalances[positiveIndex][1] -= transferAmount
        negativeBalances[negativeIndex][1] += transferAmount

        // Move to next person if balance is cleared
        if (Math.abs(positiveBalances[positiveIndex][1]) < 0.01) positiveIndex++
        if (Math.abs(negativeBalances[negativeIndex][1]) < 0.01) negativeIndex++
      }
    }

    setTransfers(optimizedTransfers)
    onTransfersCalculated(optimizedTransfers)
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