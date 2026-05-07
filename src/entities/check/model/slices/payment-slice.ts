import type { StateCreator } from 'zustand'

import type { TCheckStore } from '../types'
import { EPaymentMode } from '../types'
import { updateCheck } from './update-check'

export type TPaymentSlice = Pick<TCheckStore, 'setPaymentMode' | 'setSinglePayer'>

export const createPaymentSlice: StateCreator<TCheckStore, [], [], TPaymentSlice> = (set) => ({
  setPaymentMode: (checkId: string, mode: EPaymentMode) => {
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => {
        if (c.paymentMode === mode) return c
        return { ...c, paymentMode: mode, singlePayer: mode === EPaymentMode.Manual ? null : c.singlePayer }
      }),
    }))
  },

  setSinglePayer: (checkId: string, personId: number | null) => {
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => ({
        ...c,
        singlePayer: personId,
      })),
    }))
  },
})
