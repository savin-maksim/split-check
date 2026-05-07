import type { TTransfer } from '../model/types'

export const transferListSignature = (transfers: TTransfer[]): string => {
  if (!transfers?.length) return ''
  return JSON.stringify(transfers.map((t) => [t.from, t.to, Number(t.amount)]))
}

export const getRecipientCounts = (transfers: TTransfer[]): Map<string, number> => {
  const m = new Map<string, number>()
  for (const t of transfers) {
    m.set(t.to, (m.get(t.to) ?? 0) + 1)
  }
  return m
}

export const isEligibleForMerge = (
  index: number,
  transfers: TTransfer[],
  recipientCounts: Map<string, number>,
): boolean => {
  const t = transfers[index]
  if (!t) return false
  return (recipientCounts.get(t.to) ?? 0) >= 2
}

export const validateCommittedGroups = (transfers: TTransfer[], groups: number[][]): number[][] => {
  if (!transfers?.length || !groups?.length) return []
  const n = transfers.length
  const used = new Set<number>()
  const out: number[][] = []

  for (const raw of groups) {
    if (!Array.isArray(raw) || raw.length < 2) continue
    const uniq = [...new Set(raw)].filter((i) => typeof i === 'number' && i >= 0 && i < n && Math.floor(i) === i)
    if (uniq.length < 2) continue
    if (uniq.some((i) => used.has(i))) continue
    const to0 = transfers[uniq[0]!]!.to
    if (uniq.some((i) => transfers[i]!.to !== to0)) continue
    uniq.sort((a, b) => a - b)
    for (const i of uniq) used.add(i)
    out.push(uniq)
  }
  return out
}

const toSet = (selection: Set<number> | number[]): Set<number> =>
  selection instanceof Set ? selection : new Set(selection)

export const canMergeSelection = (
  pendingSelection: Set<number> | number[],
  transfers: TTransfer[],
  committedGroups: number[][],
): boolean => {
  const S = toSet(pendingSelection)
  if (S.size < 2) return false
  const indices = [...S]
  const to0 = transfers[indices[0]!]?.to
  if (to0 == null) return false
  if (!indices.every((i) => transfers[i]?.to === to0)) return false
  for (const g of committedGroups) {
    if (g.length === S.size && g.every((i) => S.has(i))) return false
  }
  return true
}

export const applyMerge = (pendingSelection: Set<number> | number[], committedGroups: number[][]): number[][] => {
  const S = toSet(pendingSelection)
  const sorted = [...S].sort((a, b) => a - b)
  const rest = committedGroups.filter((g) => !g.some((i) => S.has(i)))
  return [...rest, sorted]
}

export const canUnmergeSelection = (pendingSelection: Set<number> | number[], committedGroups: number[][]): boolean => {
  const S = toSet(pendingSelection)
  if (S.size === 0) return false
  const union = new Set<number>()
  for (const g of committedGroups) {
    if (g.length && g.every((i) => S.has(i))) {
      for (const i of g) union.add(i)
    }
  }
  /** Все индексы union ⊆ S; при |union| === |S| выделение совпадает с объединением подходящих групп */
  return union.size > 0 && union.size === S.size
}

export const applyUnmerge = (pendingSelection: Set<number> | number[], committedGroups: number[][]): number[][] => {
  const S = toSet(pendingSelection)
  return committedGroups.filter((g) => !(g.length && g.every((i) => S.has(i))))
}

export type TDisplayTransfer =
  | { kind: 'single'; key: string; index: number; transfer: TTransfer }
  | { kind: 'merged'; key: string; to: string; fromLabel: string; amount: number; sourceIndices: number[] }

export const buildDisplayTransfers = (transfers: TTransfer[], committedGroups: number[][]): TDisplayTransfer[] => {
  const n = transfers.length
  if (!n || !committedGroups?.length) {
    return transfers.map((t, i) => ({
      kind: 'single' as const,
      key: `single-${i}-${t.from}-${t.to}`,
      index: i,
      transfer: t,
    }))
  }

  const mergedHidden = new Set<number>()
  const mergeAtMin = new Map<number, { indices: number[]; fromLabel: string; amount: number; to: string }>()

  for (const raw of committedGroups) {
    if (!raw?.length || raw.length < 2) continue
    const indices = [...raw].sort((a, b) => a - b)
    const minI = indices[0]!
    const to = transfers[minI]?.to
    if (!to || indices.some((i) => transfers[i]?.to !== to)) continue

    for (const i of indices) mergedHidden.add(i)
    const sum = indices.reduce((s, i) => s + (Number(transfers[i]!.amount) || 0), 0)
    const amount = Math.round(sum * 100) / 100
    const fromLabel = indices.map((i) => transfers[i]!.from).join(',\n')
    mergeAtMin.set(minI, { indices, fromLabel, amount, to })
  }

  const result: TDisplayTransfer[] = []
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
    const t = transfers[i]!
    result.push({
      kind: 'single',
      key: `single-${i}-${t.from}-${t.to}`,
      index: i,
      transfer: t,
    })
  }
  return result
}
