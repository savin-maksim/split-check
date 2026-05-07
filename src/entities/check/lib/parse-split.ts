/**
 * После JSON-сериализации ключи `Record<number, number>` становятся строками.
 * Эта функция нормализует значение из persist обратно в `Record<number, number>` с числовыми ключами и числовыми значениями.
 */
export const parseSplit = (input: unknown): Record<number, number> => {
  if (input === null || typeof input !== 'object') return {}

  const result: Record<number, number> = {}
  for (const [rawKey, rawValue] of Object.entries(input as Record<string, unknown>)) {
    const key = Number(rawKey)
    if (!Number.isFinite(key)) continue
    const value = Math.max(0, Math.floor(Number(rawValue) || 0))
    result[key] = value
  }
  return result
}
