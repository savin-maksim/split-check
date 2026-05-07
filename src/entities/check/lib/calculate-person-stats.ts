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

/**
 * Одна проходка по позициям: O(items × people) без повторных filter по всему списку на каждого участника.
 * Порядок строк в `expenses` совпадает с порядком позиций в чеке.
 */
export const calculatePersonStats = (check: TCheck, balances: Map<number, number>): TPersonStats[] => {
  const { people, items } = check
  if (people.length === 0) return []

  const paidTotals = new Map<number, number>()
  const expenseByPerson = new Map<number, TExpenseItem[]>()

  for (const p of people) {
    paidTotals.set(p.id, 0)
    expenseByPerson.set(p.id, [])
  }

  for (const item of items) {
    const lineTotal = getItemTotal(item)
    const totalWeight = totalSplitWeight(item.split)
    const canShare = totalWeight > 0

    for (const person of people) {
      if (item.paidBy.includes(person.id)) {
        paidTotals.set(person.id, (paidTotals.get(person.id) ?? 0) + lineTotal)
      }

      const personWeight = readSplitWeight(item.split, person.id)
      if (!canShare || personWeight <= 0) continue

      const share = (lineTotal * personWeight) / totalWeight
      expenseByPerson.get(person.id)!.push({
        title: item.title,
        qtyNumerator: item.qty * personWeight,
        qtyDenominator: totalWeight,
        amount: Math.round(share),
      })
    }
  }

  return people.map((person) => {
    const expenses = expenseByPerson.get(person.id) ?? []
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    return {
      id: person.id,
      name: person.name,
      paidTotal: paidTotals.get(person.id) ?? 0,
      expenses,
      totalExpenses,
      balance: balances.get(person.id) ?? 0,
    }
  })
}
