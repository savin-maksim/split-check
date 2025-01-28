export const initializeDebtsMatrix = (people) => {
  const debts = {}
  people.forEach(person1 => {
    debts[person1.name] = {}
    people.forEach(person2 => {
      if (person1.id !== person2.id) {
        debts[person1.name][person2.name] = 0
      }
    })
  })
  return debts
}

export const updateDebtsForCost = (debts, cost) => {
  if (cost.paidBy.length && cost.splitBetween.length) {
    const amountPerPerson = cost.amount / cost.splitBetween.length
    const payer = cost.paidBy[0].name

    cost.splitBetween.forEach(person => {
      if (person.name !== payer) {
        debts[person.name][payer] += amountPerPerson
      }
    })
  }
}

export const calculateBalances = (debts, people) => {
  const balances = {}
  people.forEach(person => {
    balances[person.name] = 0
    Object.keys(debts).forEach(debtor => {
      if (debts[debtor][person.name]) {
        balances[person.name] += debts[debtor][person.name]  // должны мне
      }
      if (debts[person.name][debtor]) {
        balances[person.name] -= debts[person.name][debtor]  // я должен
      }
    })
  })
  return balances
}

export const separateBalances = (balances) => {
  const positiveBalances = Object.entries(balances)
    .filter(([_, balance]) => balance > 0)
    .sort(([, a], [, b]) => b - a)
  
  const negativeBalances = Object.entries(balances)
    .filter(([_, balance]) => balance < 0)
    .sort(([, a], [, b]) => a - b)

  return { positiveBalances, negativeBalances }
}

export const generateOptimalTransfers = (positiveBalances, negativeBalances) => {
  const transfers = []
  let positiveIndex = 0
  let negativeIndex = 0

  while (positiveIndex < positiveBalances.length && negativeIndex < negativeBalances.length) {
    const [creditorName, creditorBalance] = positiveBalances[positiveIndex]
    const [debtorName, debtorBalance] = negativeBalances[negativeIndex]

    const transferAmount = Math.min(creditorBalance, Math.abs(debtorBalance))
    
    if (transferAmount > 0) {
      transfers.push({
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

  return transfers
}

export const calculateStatistics = (people, costs) => {
  if (!people?.length || !costs?.length) {
    return {
      peopleStats: [],
      totalStats: {
        totalAmount: 0,
        expenses: []
      }
    }
  }

  // Calculate per-person statistics
  const peopleStats = people.map(person => {
    const personExpenses = costs.filter(cost =>
      cost.splitBetween.some(p => p.id === person.id)
    ).map(cost => {
      const splitCount = cost.splitBetween.length
      const personShare = cost.amount / splitCount
      const personQuantity = cost.quantity || 1

      return {
        description: cost.title,
        amount: personShare,
        quantity: personQuantity,
        splitCount: splitCount,
        pricePerUnit: cost.pricePerUnit || cost.amount
      }
    })

    const totalSpent = costs
      .filter(cost => cost.paidBy.some(p => p.id === person.id))
      .reduce((sum, cost) => sum + cost.amount, 0)

    const totalOwed = personExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    return {
      id: person.id,
      name: person.name,
      totalAmount: totalSpent,
      balance: totalSpent - totalOwed,
      expenses: personExpenses
    }
  })

  // Calculate total statistics
  const combinedExpenses = costs.reduce((acc, cost) => {
    const existingExpense = acc.find(exp => 
      exp.title.toLowerCase() === cost.title.toLowerCase()
    )
    
    if (existingExpense) {
      existingExpense.amount += cost.amount
      existingExpense.quantity += (cost.quantity || 1)
      existingExpense.pricePerUnit = existingExpense.amount / existingExpense.quantity
    } else {
      acc.push({
        title: cost.title,
        amount: cost.amount,
        quantity: cost.quantity || 1,
        pricePerUnit: cost.pricePerUnit || cost.amount
      })
    }
    return acc
  }, [])

  const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0)

  return {
    peopleStats,
    totalStats: {
      totalAmount,
      expenses: combinedExpenses
    }
  }
} 