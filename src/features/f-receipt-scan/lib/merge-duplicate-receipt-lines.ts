import type { TScannedItem } from '../model'

/** Ключ для склейки: нижний регистр, trim, схлопывание пробелов. */
const normalizeTitleKey = (title: string): string => title.trim().replace(/\s+/g, ' ').toLowerCase()

/**
 * Количество в штуках: только целые значения ≥ 1.
 * Любое дробное (например 1,25 от литров на чеке) считаем как 1 позицию в штуках.
 */
const normalizeQtyFromRaw = (qtyRaw: unknown): number => {
  if (typeof qtyRaw !== 'number' || !Number.isFinite(qtyRaw)) return 1
  if (!Number.isInteger(qtyRaw)) return 1
  const n = Math.trunc(qtyRaw)
  return n < 1 ? 1 : n
}

/**
 * Склеивает строки с одинаковым нормализованным названием: qty суммируется,
 * цена за единицу берётся с первой встреченной строки (как на чеке обычно одна цена на товар).
 */
export const mergeDuplicateReceiptLines = (items: TScannedItem[]): TScannedItem[] => {
  const map = new Map<string, TScannedItem>()

  for (const raw of items) {
    const titleStr = typeof raw.title === 'string' ? raw.title : String(raw.title ?? '')
    const key = normalizeTitleKey(titleStr)
    if (!key) continue

    const qty = normalizeQtyFromRaw(raw.qty)
    const priceRaw = raw.price
    const price = Number.isFinite(priceRaw) ? priceRaw : 0
    const totalPriceRaw = raw.totalPrice
    const totalPrice = Number.isFinite(totalPriceRaw) ? totalPriceRaw : price * qty

    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        title: titleStr.trim(),
        price,
        qty,
        totalPrice,
      })
      continue
    }

    map.set(key, {
      ...existing,
      qty: existing.qty + qty,
      totalPrice: existing.totalPrice + totalPrice,
    })
  }

  return [...map.values()]
}
