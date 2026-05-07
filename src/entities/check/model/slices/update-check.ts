import type { TCheck } from '../types'

/** Иммутабельно обновить чек по id. */
export const updateCheck = (
  checks: TCheck[],
  checkId: string,
  updater: (check: TCheck) => TCheck,
): TCheck[] => checks.map((c) => (c.id === checkId ? updater(c) : c))
