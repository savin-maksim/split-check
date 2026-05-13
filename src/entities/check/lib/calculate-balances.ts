import type { TCheck, TItem, TTransfer } from '../model/types'
import { EPaymentMode } from '../model/types'
import { allocateKopecks } from './allocate-kopecks'
import { getItemTotal } from './get-item-total'
import { readSplitWeight, totalSplitWeight } from './read-split-weight'

/** Плательщик для расчётов: в режиме single — `singlePayer`, иначе — первый из `people` в `item.paidBy`. */
const getEffectivePayerId = (check: TCheck, item: TItem): number | null => {
  if (check.paymentMode === EPaymentMode.Single && check.singlePayer != null) {
    return check.singlePayer
  }
  const found = check.people.find((p) => item.paidBy === p.id)
  return found?.id ?? null
}

type TDistribution =
  | { type: 'equal'; participants: string[] }
  | { type: 'weighted'; items: { name: string; units: number }[] }

type TProduct = {
  name: string
  amount: number
  payer: string
  distribution: TDistribution
}

/**
 * Соответствие имя → индекс в векторах actual/expected.
 * Ограничение модели: `TTransfer` и распределение идут по строковым именам; при дубликатах имён в `check.people`
 * индекс будет последнего такого имени — данные вне этого контракта считаются некорректными.
 */
const buildIndexMap = (peopleList: string[]): Map<string, number> => {
  const map = new Map<string, number>()
  for (let i = 0; i < peopleList.length; i++) map.set(peopleList[i]!, i)
  return map
}

const checkToProducts = (check: TCheck): TProduct[] => {
  const peopleById = new Map(check.people.map((p) => [p.id, p]))

  return check.items.map((item) => {
    const amount = getItemTotal(item)
    const effectivePayerId = getEffectivePayerId(check, item)
    const payer = effectivePayerId != null ? (peopleById.get(effectivePayerId)?.name ?? '') : ''

    const totalWeight = totalSplitWeight(item.split)

    const distribution: TDistribution =
      totalWeight > 0
        ? {
            type: 'weighted',
            items: check.people
              .map((p) => ({ name: p.name, units: readSplitWeight(item.split, p.id) }))
              .filter((x) => x.units > 0),
          }
        : {
            type: 'equal',
            participants: check.people.filter((p) => readSplitWeight(item.split, p.id) > 0).map((p) => p.name),
          }

    return { name: item.title, amount, payer, distribution }
  })
}

const getActualSpent = (products: TProduct[], peopleMap: Map<string, number>): number[] => {
  const result = Array.from({ length: peopleMap.size }, () => 0)

  for (const product of products) {
    const idx = peopleMap.get(product.payer)
    if (idx !== undefined) {
      result[idx] = (result[idx] ?? 0) + product.amount
    }
  }

  return result
}

const getExpectedSpent = (products: TProduct[], peopleMap: Map<string, number>): number[] => {
  const result = Array.from({ length: peopleMap.size }, () => 0)

  for (const product of products) {
    const { distribution } = product

    if (distribution.type === 'equal') {
      const { participants } = distribution
      if (!participants.length) continue

      for (const { target: name, amount } of allocateKopecks(
        product.amount,
        participants.map((name) => ({ target: name, weight: 1 })),
      )) {
        const idx = peopleMap.get(name)
        if (idx !== undefined) {
          result[idx] = (result[idx] ?? 0) + amount
        }
      }
    } else {
      const { items } = distribution
      if (!items.length) continue

      for (const { target: row, amount } of allocateKopecks(
        product.amount,
        items.map((row) => ({ target: row, weight: row.units })),
      )) {
        const idx = peopleMap.get(row.name)
        if (idx !== undefined) {
          result[idx] = (result[idx] ?? 0) + amount
        }
      }
    }
  }

  return result
}

type TBalance = { person: string; balance: number }

const getBalances = (actual: number[], expected: number[], peopleList: string[]): TBalance[] =>
  actual
    .map((value, i) => ({
      person: peopleList[i]!,
      balance: value - expected[i]!,
    }))
    .sort((a, b) => b.balance - a.balance)

const settleDebts = (balances: TBalance[]): TTransfer[] => {
  const creditors = balances.filter((b) => b.balance > 0)
  const debtors = balances.filter((b) => b.balance < 0)

  const result: TTransfer[] = []
  let i = 0
  let j = debtors.length - 1

  while (i < creditors.length && j >= 0) {
    const credit = creditors[i]!
    const debt = debtors[j]!
    const amount = Math.min(credit.balance, Math.abs(debt.balance))

    result.push({
      from: debt.person,
      to: credit.person,
      amount,
    })

    credit.balance -= amount
    debt.balance += amount

    if (credit.balance === 0) i++
    if (debt.balance === 0) j--
  }

  return result
}

export type TCheckSettlement = {
  balanceMap: Map<number, number>
  transfers: TTransfer[]
}

/** Один проход по чеку: балансы и переводы согласованы; внутри не дублируется `checkToProducts`. */
export const computeCheckSettlement = (check: TCheck): TCheckSettlement => {
  const products = checkToProducts(check)
  const peopleNames = check.people.map((p) => p.name)
  const balanceMap = new Map<number, number>()

  if (peopleNames.length === 0) {
    return { balanceMap, transfers: [] }
  }

  const peopleMap = buildIndexMap(peopleNames)
  const actual = getActualSpent(products, peopleMap)
  const expected = getExpectedSpent(products, peopleMap)

  for (let i = 0; i < check.people.length; i++) {
    const person = check.people[i]!
    balanceMap.set(person.id, actual[i]! - expected[i]!)
  }

  if (!products.length) {
    return { balanceMap, transfers: [] }
  }

  let transfers: TTransfer[]
  if (check.paymentMode === EPaymentMode.Single && check.singlePayer != null) {
    const payerPerson = check.people.find((p) => p.id === check.singlePayer)
    if (payerPerson) {
      transfers = peopleNames
        .map((person, i) => ({ person, amount: expected[i]! }))
        .filter((d) => d.amount > 0 && d.person !== payerPerson.name)
        .map((d) => ({ from: d.person, to: payerPerson.name, amount: d.amount }))
    } else {
      transfers = settleDebts(getBalances(actual, expected, peopleNames))
    }
  } else {
    transfers = settleDebts(getBalances(actual, expected, peopleNames))
  }

  return { balanceMap, transfers }
}

export const calculateBalances = (check: TCheck): Map<number, number> => computeCheckSettlement(check).balanceMap

export const generateTransfers = (check: TCheck): TTransfer[] => computeCheckSettlement(check).transfers
