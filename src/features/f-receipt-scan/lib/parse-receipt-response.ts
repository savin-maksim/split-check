import type { TScannedItem } from '../model'

const isScannedItem = (value: unknown): value is TScannedItem => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.title === 'string' && typeof v.qty === 'number' && typeof v.price === 'number'
}

export const parseReceiptResponse = (text: string): TScannedItem[] => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('PARSE_JSON_FAILED')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('INVALID_JSON_SHAPE')
  }

  if (!parsed.every(isScannedItem)) {
    throw new Error('INVALID_JSON_SHAPE')
  }

  return parsed
}
