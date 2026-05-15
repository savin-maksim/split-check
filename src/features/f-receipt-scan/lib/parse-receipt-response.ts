import type { TScannedItem } from '../model'

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isScannedItem = (value: TScannedItem | null): value is TScannedItem => value !== null

const normalizeScannedItem = (value: unknown): TScannedItem | null => {
  if (typeof value !== 'object' || value === null) return null
  const v = value as Record<string, unknown>

  const title = typeof v.title === 'string' ? v.title : typeof v.name === 'string' ? v.name : ''
  const quantity = isFiniteNumber(v.qty) ? v.qty : isFiniteNumber(v.quantity) ? v.quantity : NaN
  const unitPrice = isFiniteNumber(v.price) ? v.price : isFiniteNumber(v.unitPrice) ? v.unitPrice : NaN
  const totalPrice = isFiniteNumber(v.totalPrice) ? v.totalPrice : NaN

  if (!title || !Number.isFinite(quantity) || !Number.isFinite(totalPrice)) {
    return null
  }

  const qty = quantity > 1 ? quantity : 1
  const price = quantity < 1 ? totalPrice : Number.isFinite(unitPrice) ? unitPrice : totalPrice / qty

  if (!Number.isFinite(price)) {
    return null
  }

  return { title, qty, price, totalPrice }
}

export const parseReceiptResponse = (text: string): TScannedItem[] => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
    console.log('[receipt-scan] Gemini JSON:', parsed)
  } catch {
    throw new Error('PARSE_JSON_FAILED')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('INVALID_JSON_SHAPE')
  }

  const items = parsed.map(normalizeScannedItem)

  if (!items.every(isScannedItem)) {
    throw new Error('INVALID_JSON_SHAPE')
  }

  console.log('[receipt-scan] Normalized items:', items)

  return items
}
