import * as math from 'mathjs'

/**
 * @typedef {{ name: string, amount: number, payer: string, distribution: { type: 'equal', participants: string[] } | { type: 'weighted', items: { name: string, units: number }[] } }} ProductInput
 */

function buildIndexMap(peopleList) {
  const map = new Map()
  peopleList.forEach((p, i) => map.set(p, i))
  return map
}

export function getLineAmount(cost) {
  const qty = cost.quantity ?? 1
  const ppu = cost.pricePerUnit
  if (ppu != null && !Number.isNaN(Number(ppu))) {
    return qty * Number(ppu)
  }
  return Number(cost.amount) || 0
}

function readWeight(weights, personId) {
  if (!weights) return 0
  const raw = weights[personId] ?? weights[String(personId)]
  return Math.max(0, Math.floor(Number(raw) || 0))
}

/**
 * @param {object[]} costsData
 * @param {{ id: number|string, name: string }[]} people
 * @returns {ProductInput[]}
 */
export function costsToProducts(costsData, people) {
  return costsData.map((cost) => {
    const amount = getLineAmount(cost)
    const payer = cost.paidBy?.[0]?.name ?? ''
    const distribution =
      cost.distributionType === 'weighted'
        ? {
            type: 'weighted',
            items: people
              .map((p) => ({
                name: p.name,
                units: readWeight(cost.weights, p.id)
              }))
              .filter((x) => x.units > 0)
          }
        : {
            type: 'equal',
            participants: (cost.splitBetween ?? []).map((p) => p.name)
          }

    return {
      name: cost.title ?? '',
      amount,
      payer,
      distribution
    }
  })
}

function getActualSpent(productsData, peopleMap, options = {}) {
  const useProductPayer = options.useProductPayer ?? false
  const result = Array.from({ length: peopleMap.size }, () => math.bignumber(0))

  for (const product of productsData) {
    const payer = useProductPayer
      ? product.payer
      : (product.singlePayer ?? product.payer)
    const idx = peopleMap.get(payer)

    if (idx !== undefined) {
      result[idx] = math.add(result[idx], math.bignumber(product.amount))
    }
  }

  return result
}

function getExpectedSpent(productsData, peopleMap) {
  const result = Array.from({ length: peopleMap.size }, () => math.bignumber(0))

  for (const product of productsData) {
    const total = math.bignumber(product.amount)
    const { distribution } = product

    if (distribution.type === 'equal') {
      const participants = distribution.participants
      if (!participants.length) continue
      const share = math.divide(total, participants.length)

      for (const name of participants) {
        const idx = peopleMap.get(name)
        if (idx !== undefined) {
          result[idx] = math.add(result[idx], share)
        }
      }
    } else if (distribution.type === 'weighted') {
      const items = distribution.items
      if (!items.length) continue
      const totalUnits = items.reduce((sum, p) => sum + p.units, 0)
      if (totalUnits === 0) continue

      for (const item of items) {
        const share = math.multiply(
          math.divide(math.bignumber(item.units), math.bignumber(totalUnits)),
          total
        )
        const idx = peopleMap.get(item.name)
        if (idx !== undefined) {
          result[idx] = math.add(result[idx], share)
        }
      }
    }
  }

  return result
}

function getBalances(actual, expected, peopleList) {
  return actual
    .map((value, i) => ({
      person: peopleList[i],
      balance: math.subtract(value, expected[i])
    }))
    .sort((a, b) => math.compare(b.balance, a.balance))
}

function settleDebts(balances) {
  const creditors = balances.filter((b) => math.larger(b.balance, 0))
  const debtors = balances.filter((b) => math.smaller(b.balance, 0))

  const result = []
  let i = 0
  let j = debtors.length - 1

  while (i < creditors.length && j >= 0) {
    const credit = creditors[i]
    const debt = debtors[j]
    const amount = math.min(credit.balance, math.abs(debt.balance))

    result.push({
      from: debt.person,
      to: credit.person,
      amount: math.number(math.round(amount, 2))
    })

    credit.balance = math.subtract(credit.balance, amount)
    debt.balance = math.add(debt.balance, amount)

    if (math.equal(credit.balance, 0)) i++
    if (math.equal(debt.balance, 0)) j--
  }

  return result
}

function roundForDisplay(value) {
  return math.number(math.round(value, 2))
}

/**
 * @param {ProductInput[]} productsData
 * @param {string[]} peopleList
 */
export function computeAll(productsData, peopleList) {
  const peopleMap = buildIndexMap(peopleList)

  const expected = getExpectedSpent(productsData, peopleMap)
  const expectedRounded = expected.map(roundForDisplay)

  const actualPerProduct = getActualSpent(productsData, peopleMap, {
    useProductPayer: true
  })
  const balancesPerProduct = getBalances(actualPerProduct, expected, peopleList)
  const balanceSnapshot = balancesPerProduct.map((b) => ({
    person: b.person,
    balance: b.balance
  }))
  const transactionsPerProduct = settleDebts(balancesPerProduct)

  const singlePayerDebts = peopleList
    .map((person, i) => ({ person, amount: expectedRounded[i] }))
    .filter((d) => d.amount > 0)

  return {
    perProduct: {
      actual: actualPerProduct.map(roundForDisplay),
      expected: expectedRounded,
      balances: balanceSnapshot.map((b) => ({
        person: b.person,
        balance: roundForDisplay(b.balance)
      })),
      transactions: transactionsPerProduct
    },
    getSinglePayerTransactions(singlePayer) {
      return singlePayerDebts
        .filter((d) => d.person !== singlePayer)
        .map((d) => ({
          from: d.person,
          to: singlePayer,
          amount: d.amount
        }))
    }
  }
}

/**
 * @param {{ id: number|string, name: string }[]} people
 * @param {object[]} costs
 * @param {'single'|'manual'} paymentMode
 * @param {{ name: string }|null} singlePayer
 * @returns {{ from: string, to: string, amount: number }[]}
 */
export function getTransfersFromCosts(people, costs, paymentMode, singlePayer) {
  if (!people?.length || !costs?.length) return []

  const peopleNames = people.map((p) => p.name)
  const products = costsToProducts(costs, people)
  const result = computeAll(products, peopleNames)

  if (paymentMode === 'single' && singlePayer?.name) {
    return result.getSinglePayerTransactions(singlePayer.name)
  }
  return result.perProduct.transactions
}
