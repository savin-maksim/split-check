import type { TCheck, TItem } from '../model/types'
import { getItemTotal } from './get-item-total'

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
  qty: number
  splitCount: number
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
      .filter((item) => (item.split[person.id] ?? 0) > 0)
      .map((item) => {
        const totalWeight = Object.values(item.split).reduce(
          (s, w) => s + Math.max(0, w),
          0,
        )
        const personWeight = item.split[person.id] ?? 0
        const share =
          totalWeight > 0 ? (getItemTotal(item) * personWeight) / totalWeight : 0
        return {
          title: item.title,
          qty: item.qty,
          splitCount: Object.values(item.split).filter((w) => w > 0).length,
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
