import { useMemo } from 'react'

import type { TCheck } from '../model/types'
import { calculateBalances, generateTransfers } from './calculate-balances'

export const useCheckBalances = (check: TCheck | undefined) => {
  const balances = useMemo(() => {
    if (!check) return new Map<number, number>()
    return calculateBalances(check)
  }, [check])

  const transfers = useMemo(() => {
    if (!check) return []
    return generateTransfers(check)
  }, [check])

  return { balances, transfers }
}
