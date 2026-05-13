import type { StateCreator } from 'zustand'

import { generateId } from '@shared/lib/generate-id'
import { formatItemTitle } from '@shared/lib/parse-names'

import type { TCheck, TCheckStore } from '../types'
import { EPaymentMode } from '../types'
import { updateCheck } from './update-check'

export type TChecksSlice = Pick<
  TCheckStore,
  'checks' | 'currentCheckId' | 'addCheck' | 'removeCheck' | 'updateCheckTitle' | 'loadCheck'
>

export const createChecksSlice: StateCreator<TCheckStore, [], [], TChecksSlice> = (set) => ({
  checks: [],
  currentCheckId: null,

  addCheck: (title: string) => {
    const id = generateId()
    const check: TCheck = {
      id,
      title: formatItemTitle(title) || 'Без названия',
      createdAt: Date.now(),
      paymentMode: EPaymentMode.Manual,
      singlePayer: null,
      nextPersonId: 1,
      nextItemId: 1,
      people: [],
      items: [],
    }
    set((s) => ({ checks: [check, ...s.checks], currentCheckId: id }))
    return id
  },

  removeCheck: (checkId: string) => {
    set((s) => ({
      checks: s.checks.filter((c) => c.id !== checkId),
      currentCheckId: s.currentCheckId === checkId ? null : s.currentCheckId,
    }))
  },

  updateCheckTitle: (checkId: string, title: string) => {
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => ({
        ...c,
        title: formatItemTitle(title) || 'Без названия',
      })),
    }))
  },

  loadCheck: (checkId: string) => {
    set({ currentCheckId: checkId })
  },
})
