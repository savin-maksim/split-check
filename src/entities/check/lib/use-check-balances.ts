import { useMemo } from 'react'

import type { TCheck, TTransfer } from '../model/types'

import { computeCheckSettlement } from './calculate-balances'

const emptyBalances = new Map<number, number>()
const emptyTransfers: TTransfer[] = []

export const useCheckBalances = (check: TCheck | undefined) =>
  useMemo(() => {
    if (!check) {
      return { balances: emptyBalances, transfers: emptyTransfers }
    }
    const { balanceMap, transfers } = computeCheckSettlement(check)
    return { balances: balanceMap, transfers }
  }, [check])
