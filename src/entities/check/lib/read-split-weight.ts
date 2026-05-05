export const readSplitWeight = (split: Record<number, number>, personId: number): number => {
  const raw = split[personId]
  return Math.max(0, Math.floor(Number(raw) || 0))
}

export const totalSplitWeight = (split: Record<number, number>): number =>
  Object.values(split).reduce((sum, w) => sum + Math.max(0, Math.floor(Number(w) || 0)), 0)
