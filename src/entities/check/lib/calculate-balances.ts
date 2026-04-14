import {
  bignumber,
  add,
  subtract,
  divide,
  multiply,
  compare,
  larger,
  smaller,
  equal,
  roundForDisplay,
  mathMin,
  mathAbs,
  toNumber,
  round,
} from '@/shared/lib/math'
import type { BigNumber } from '@/shared/lib/math'

import type { TCheck, TTransfer } from '../model/types'
import { getItemTotal } from './get-item-total'

type TDistribution =
  | { type: 'equal'; participants: string[] }
  | { type: 'weighted'; items: { name: string; units: number }[] }

type TProduct = {
  name: string
  amount: number
  payer: string
  distribution: TDistribution
}

const buildIndexMap = (peopleList: string[]): Map<string, number> => {
  const map = new Map<string, number>()
  peopleList.forEach((p, i) => map.set(p, i))
  return map
}

const readWeight = (split: Record<number, number>, personId: number): number => {
  const raw = split[personId]
  return Math.max(0, Math.floor(Number(raw) || 0))
}

export const checkToProducts = (check: TCheck): TProduct[] => {
  return check.items.map((item) => {
    const amount = getItemTotal(item)
    const payerPerson = check.people.find((p) => item.paidBy.includes(p.id))
    const payer = payerPerson?.name ?? ''

    const totalWeight = Object.values(item.split).reduce((s, w) => s + Math.max(0, Math.floor(Number(w) || 0)), 0)

    const distribution: TDistribution =
      totalWeight > 0
        ? {
            type: 'weighted',
            items: check.people
              .map((p) => ({ name: p.name, units: readWeight(item.split, p.id) }))
              .filter((x) => x.units > 0),
          }
        : {
            type: 'equal',
            participants: check.people.filter((p) => readWeight(item.split, p.id) > 0).map((p) => p.name),
          }

    return { name: item.title, amount, payer, distribution }
  })
}

const getActualSpent = (products: TProduct[], peopleMap: Map<string, number>): BigNumber[] => {
  const result = Array.from({ length: peopleMap.size }, () => bignumber(0))

  for (const product of products) {
    const idx = peopleMap.get(product.payer)
    if (idx !== undefined) {
      result[idx] = add(result[idx]!, bignumber(product.amount)) as BigNumber
    }
  }

  return result
}

const getExpectedSpent = (products: TProduct[], peopleMap: Map<string, number>): BigNumber[] => {
  const result = Array.from({ length: peopleMap.size }, () => bignumber(0))

  for (const product of products) {
    const total = bignumber(product.amount)
    const { distribution } = product

    if (distribution.type === 'equal') {
      const { participants } = distribution
      if (!participants.length) continue
      const share = divide(total, participants.length) as BigNumber

      for (const name of participants) {
        const idx = peopleMap.get(name)
        if (idx !== undefined) {
          result[idx] = add(result[idx]!, share) as BigNumber
        }
      }
    } else if (distribution.type === 'weighted') {
      const { items } = distribution
      if (!items.length) continue
      const totalUnits = items.reduce((sum, p) => sum + p.units, 0)
      if (totalUnits === 0) continue

      for (const item of items) {
        const share = multiply(divide(bignumber(item.units), bignumber(totalUnits)) as BigNumber, total) as BigNumber
        const idx = peopleMap.get(item.name)
        if (idx !== undefined) {
          result[idx] = add(result[idx]!, share) as BigNumber
        }
      }
    }
  }

  return result
}

type TBalance = { person: string; balance: BigNumber }

const getBalances = (actual: BigNumber[], expected: BigNumber[], peopleList: string[]): TBalance[] => {
  return actual
    .map((value, i) => ({
      person: peopleList[i]!,
      balance: subtract(value, expected[i]!) as BigNumber,
    }))
    .sort((a, b) => compare(b.balance, a.balance) as number)
}

const settleDebts = (balances: TBalance[]): TTransfer[] => {
  const creditors = balances.filter((b) => larger(b.balance, 0) as boolean)
  const debtors = balances.filter((b) => smaller(b.balance, 0) as boolean)

  const result: TTransfer[] = []
  let i = 0
  let j = debtors.length - 1

  while (i < creditors.length && j >= 0) {
    const credit = creditors[i]!
    const debt = debtors[j]!
    const amount = mathMin(credit.balance, mathAbs(debt.balance) as BigNumber) as BigNumber

    result.push({
      from: debt.person,
      to: credit.person,
      amount: toNumber(round(amount, 2)) as number,
    })

    credit.balance = subtract(credit.balance, amount) as BigNumber
    debt.balance = add(debt.balance, amount) as BigNumber

    if (equal(credit.balance, 0)) i++
    if (equal(debt.balance, 0)) j--
  }

  return result
}

export const calculateBalances = (check: TCheck): Map<number, number> => {
  const products = checkToProducts(check)
  const peopleNames = check.people.map((p) => p.name)
  const peopleMap = buildIndexMap(peopleNames)

  const actual = getActualSpent(products, peopleMap)
  const expected = getExpectedSpent(products, peopleMap)

  const balanceMap = new Map<number, number>()
  check.people.forEach((person, i) => {
    const balance = subtract(actual[i]!, expected[i]!) as BigNumber
    balanceMap.set(person.id, roundForDisplay(balance))
  })

  return balanceMap
}

export const generateTransfers = (check: TCheck): TTransfer[] => {
  const products = checkToProducts(check)
  const peopleNames = check.people.map((p) => p.name)
  if (!peopleNames.length || !products.length) return []

  const peopleMap = buildIndexMap(peopleNames)
  const actual = getActualSpent(products, peopleMap)
  const expected = getExpectedSpent(products, peopleMap)
  const balances = getBalances(actual, expected, peopleNames)

  if (check.paymentMode === 'single' && check.singlePayer != null) {
    const payerPerson = check.people.find((p) => p.id === check.singlePayer)
    if (payerPerson) {
      const expectedRounded = expected.map(roundForDisplay)
      return peopleNames
        .map((person, i) => ({ person, amount: expectedRounded[i]! }))
        .filter((d) => d.amount > 0 && d.person !== payerPerson.name)
        .map((d) => ({ from: d.person, to: payerPerson.name, amount: d.amount }))
    }
  }

  return settleDebts(balances)
}
