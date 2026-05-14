import type { TScannedItem } from '../model'

const normalizeScannedItem = (value: unknown): TScannedItem | null => {
  if (typeof value !== 'object' || value === null) return null
  const v = value as Record<string, unknown>

  const title = typeof v.title === 'string' ? v.title : typeof v.name === 'string' ? v.name : ''
  const qty = typeof v.qty === 'number' ? v.qty : typeof v.quantity === 'number' ? v.quantity : NaN
  const price = typeof v.price === 'number' ? v.price : typeof v.unitPrice === 'number' ? v.unitPrice : NaN
  const totalPrice = typeof v.totalPrice === 'number' && Number.isFinite(v.totalPrice) ? v.totalPrice : NaN

  if (!title || !Number.isFinite(qty) || !Number.isFinite(price) || !Number.isFinite(totalPrice)) {
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

  if (items.some((item) => item === null)) {
    throw new Error('INVALID_JSON_SHAPE')
  }

  console.log('[receipt-scan] Normalized items:', items)

  return items
}
