import type { TCheck } from '../model/types'
import { getItemTotal } from './get-item-total'
import { readSplitWeight, totalSplitWeight } from './read-split-weight'

export type TPersonStats = {
  id: number
  name: string
  paidTotal: number
  expenses: TExpenseItem[]
  totalExpenses: number
  balance: number
}

export type TExpenseItem = {
  title: string
  qtyNumerator: number
  qtyDenominator: number
  amount: number
}

export const calculatePersonStats = (
  check: TCheck,
  balances: Map<number, number>,
): TPersonStats[] => {
  const people = check.people
  const items = check.items

  return people.map((person) => {
    const paidItems = items.filter((item) => item.paidBy.includes(person.id))
    const paidTotal = paidItems.reduce((sum, item) => sum + getItemTotal(item), 0)

    const expenses = items
      .filter((item) => readSplitWeight(item.split, person.id) > 0)
      .map((item) => {
        const totalWeight = totalSplitWeight(item.split)
        const personWeight = readSplitWeight(item.split, person.id)
        const share =
          totalWeight > 0 ? (getItemTotal(item) * personWeight) / totalWeight : 0
        return {
          title: item.title,
          qtyNumerator: item.qty * personWeight,
          qtyDenominator: totalWeight,
          amount: Math.round(share),
        }
      })

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const balance = balances.get(person.id) ?? 0

    return {
      id: person.id,
      name: person.name,
      paidTotal,
      expenses,
      totalExpenses,
      balance,
    }
  })
}
