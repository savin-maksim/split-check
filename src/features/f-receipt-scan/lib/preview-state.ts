import type { TPreviewQuantities, TScannedItem } from '../model'

export const createInitialSelection = (items: TScannedItem[]): Set<number> => new Set(items.map((_, index) => index))

export const createInitialQuantities = (items: TScannedItem[]): TPreviewQuantities =>
  Object.fromEntries(items.map((item, index) => [index, Math.max(1, item.qty || 1)]))

export const calculateSelectedTotal = (
  items: TScannedItem[],
  selectedIndexes: Set<number>,
  quantities: TPreviewQuantities,
): number =>
  items.reduce((sum, item, index) => {
    if (!selectedIndexes.has(index)) return sum
    return sum + item.price * (quantities[index] ?? item.qty)
  }, 0)

export const toggleSelectedIndex = (selectedIndexes: Set<number>, index: number): Set<number> => {
  const next = new Set(selectedIndexes)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  return next
}

export const bumpPreviewQuantity = (
  quantities: TPreviewQuantities,
  items: TScannedItem[],
  index: number,
  delta: number,
): TPreviewQuantities => {
  const current = quantities[index] ?? items[index]?.qty ?? 1
  return { ...quantities, [index]: Math.max(1, current + delta) }
}
