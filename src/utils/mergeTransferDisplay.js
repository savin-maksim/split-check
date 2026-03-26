/**
 * Сигнатура списка переводов для восстановления выбора после перезагрузки.
 * @param {{ from: string, to: string, amount: number }[]} transfers
 */
export function transferListSignature(transfers) {
  if (!transfers?.length) return ''
  return JSON.stringify(
    transfers.map((t) => [t.from, t.to, Number(t.amount)])
  )
}

/**
 * Сколько переводов на каждого получателя (по полю `to`).
 * @param {{ from: string, to: string, amount: number }[]} transfers
 * @returns {Map<string, number>}
 */
export function getRecipientCounts(transfers) {
  const m = new Map()
  for (const t of transfers) {
    m.set(t.to, (m.get(t.to) || 0) + 1)
  }
  return m
}

/**
 * Строка участвует в объединении, если у этого получателя ≥ 2 перевода в списке.
 */
export function isEligibleForMerge(index, transfers, recipientCounts) {
  const t = transfers[index]
  if (!t) return false
  return (recipientCounts.get(t.to) || 0) >= 2
}

/**
 * @param {Set<number>|number[]} selection
 * @returns {Set<number>}
 */
function toSet(selection) {
  return selection instanceof Set ? selection : new Set(selection)
}

/**
 * Оставляет только валидные непересекающиеся группы (≥2 индексов, один `to`).
 * @param {{ from: string, to: string, amount: number }[]} transfers
 * @param {number[][]} groups
 * @returns {number[][]}
 */
export function validateCommittedGroups(transfers, groups) {
  if (!transfers?.length || !groups?.length) return []
  const n = transfers.length
  const used = new Set()
  /** @type {number[][]} */
  const out = []

  for (const raw of groups) {
    if (!Array.isArray(raw) || raw.length < 2) continue
    const uniq = [...new Set(raw)].filter(
      (i) => typeof i === 'number' && i >= 0 && i < n && Math.floor(i) === i
    )
    if (uniq.length < 2) continue
    if (uniq.some((i) => used.has(i))) continue
    const to0 = transfers[uniq[0]].to
    if (uniq.some((i) => transfers[i].to !== to0)) continue
    uniq.sort((a, b) => a - b)
    for (const i of uniq) used.add(i)
    out.push(uniq)
  }
  return out
}

/**
 * @param {number[]} a
 * @param {Set<number>} b
 */
function setEqualsSortedArray(s, arr) {
  if (s.size !== arr.length) return false
  for (const x of arr) {
    if (!s.has(x)) return false
  }
  return true
}

/**
 * @param {Set<number>|number[]} pendingSelection
 * @param {{ from: string, to: string, amount: number }[]} transfers
 * @param {number[][]} committedGroups
 */
export function canMergeSelection(pendingSelection, transfers, committedGroups) {
  const S = toSet(pendingSelection)
  if (S.size < 2) return false
  const indices = [...S]
  const to0 = transfers[indices[0]]?.to
  if (to0 == null) return false
  if (!indices.every((i) => transfers[i]?.to === to0)) return false

  for (const g of committedGroups) {
    if (setEqualsSortedArray(S, g)) return false
  }
  return true
}

/**
 * @param {Set<number>|number[]} pendingSelection
 * @param {number[][]} committedGroups
 */
export function applyMerge(pendingSelection, committedGroups) {
  const S = toSet(pendingSelection)
  const sorted = [...S].sort((a, b) => a - b)
  const rest = committedGroups.filter((g) => !g.some((i) => S.has(i)))
  return [...rest, sorted]
}

/**
 * @param {Set<number>|number[]} pendingSelection
 * @param {number[][]} committedGroups
 */
export function canUnmergeSelection(pendingSelection, committedGroups) {
  const S = toSet(pendingSelection)
  if (S.size === 0) return false

  const union = new Set()
  for (const g of committedGroups) {
    if (g.length && g.every((i) => S.has(i))) {
      for (const i of g) union.add(i)
    }
  }
  if (union.size === 0) return false
  if (union.size !== S.size) return false
  for (const i of S) {
    if (!union.has(i)) return false
  }
  return true
}

/**
 * @param {Set<number>|number[]} pendingSelection
 * @param {number[][]} committedGroups
 */
export function applyUnmerge(pendingSelection, committedGroups) {
  const S = toSet(pendingSelection)
  return committedGroups.filter((g) => !(g.length && g.every((i) => S.has(i))))
}

/**
 * @param {{ from: string, to: string, amount: number }[]} transfers
 * @param {number[][]} committedGroups — непересекающиеся группы индексов с одним `to`
 * @returns {(
 *   | { kind: 'single'; key: string; index: number; transfer: { from: string; to: string; amount: number } }
 *   | { kind: 'merged'; key: string; to: string; fromLabel: string; amount: number; sourceIndices: number[] }
 * )[]}
 */
export function buildDisplayTransfers(transfers, committedGroups) {
  const n = transfers.length
  if (!n || !committedGroups?.length) {
    return transfers.map((t, i) => ({
      kind: 'single',
      key: `single-${i}-${t.from}-${t.to}`,
      index: i,
      transfer: t,
    }))
  }

  const mergedHidden = new Set()
  /** @type {Map<number, { indices: number[]; fromLabel: string; amount: number; to: string }>} */
  const mergeAtMin = new Map()

  for (const raw of committedGroups) {
    if (!raw?.length || raw.length < 2) continue
    const indices = [...raw].sort((a, b) => a - b)
    const minI = indices[0]
    const to = transfers[minI]?.to
    if (indices.some((i) => transfers[i]?.to !== to)) continue

    for (const i of indices) mergedHidden.add(i)
    const sum = indices.reduce((s, i) => s + (Number(transfers[i].amount) || 0), 0)
    const amount = Math.round(sum * 100) / 100
    const fromLabel = indices.map((i) => transfers[i].from).join(',\n')
    mergeAtMin.set(minI, { indices, fromLabel, amount, to })
  }

  const result = []
  for (let i = 0; i < n; i++) {
    if (mergedHidden.has(i)) {
      const info = mergeAtMin.get(i)
      if (info) {
        result.push({
          kind: 'merged',
          key: `merged-${info.to}-${info.indices.join('-')}`,
          to: info.to,
          fromLabel: info.fromLabel,
          amount: info.amount,
          sourceIndices: info.indices,
        })
      }
      continue
    }
    const t = transfers[i]
    result.push({
      kind: 'single',
      key: `single-${i}-${t.from}-${t.to}`,
      index: i,
      transfer: t,
    })
  }
  return result
}
