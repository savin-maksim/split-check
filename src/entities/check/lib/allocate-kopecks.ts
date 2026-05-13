export type TKopeckAllocationInput<TTarget> = {
  target: TTarget
  weight: number
}

export type TKopeckAllocation<TTarget> = {
  target: TTarget
  amount: number
}

export const allocateKopecks = <TTarget>(
  amount: number,
  recipients: readonly TKopeckAllocationInput<TTarget>[],
): TKopeckAllocation<TTarget>[] => {
  const safeAmount = Math.max(0, Math.trunc(amount) || 0)
  const rows = recipients.map((recipient, index) => ({
    target: recipient.target,
    weight: Math.max(0, Math.floor(Number(recipient.weight) || 0)),
    index,
    base: 0,
    remainder: 0,
  }))

  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0)
  if (safeAmount === 0 || totalWeight === 0) {
    return rows.map((row) => ({ target: row.target, amount: 0 }))
  }

  let allocated = 0
  for (const row of rows) {
    const weightedAmount = safeAmount * row.weight
    row.base = Math.floor(weightedAmount / totalWeight)
    row.remainder = weightedAmount % totalWeight
    allocated += row.base
  }

  let remaining = safeAmount - allocated
  const byRemainder = [...rows].sort((a, b) => b.remainder - a.remainder || a.index - b.index)

  for (let i = 0; i < byRemainder.length && remaining > 0; i++) {
    byRemainder[i]!.base += 1
    remaining--
  }

  return rows.map((row) => ({ target: row.target, amount: row.base }))
}
