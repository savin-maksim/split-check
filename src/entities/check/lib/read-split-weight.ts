/** Нормализация веса доли (JSON/localStorage могут дать строку или дробь). */
const normalizeSplitUnit = (raw: unknown): number => Math.max(0, Math.floor(Number(raw) || 0))

export const readSplitWeight = (split: Record<number, number>, personId: number): number =>
  normalizeSplitUnit(split[personId])

export const totalSplitWeight = (split: Record<number, number>): number =>
  Object.values(split).reduce((sum, w) => sum + normalizeSplitUnit(w), 0)

/** Есть ли в split хотя бы одна «весовая» единица (> 1) после нормализации. */
export const hasWeightedSplitUnit = (split: Record<number, number>): boolean =>
  Object.values(split).some((w) => normalizeSplitUnit(w) > 1)
