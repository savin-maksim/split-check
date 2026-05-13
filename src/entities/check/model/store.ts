import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@shared/constants'

import { parseSplit } from '../lib/parse-split'
import type { TCheck, TCheckStore } from './types'
import { createChecksSlice, createItemsSlice, createPaymentSlice, createPeopleSlice } from './slices'

const normalizeChecks = (checks: TCheck[]): TCheck[] =>
  checks.map((check) => ({
    ...check,
    items: check.items.map((item) => ({ ...item, split: parseSplit(item.split) })),
  }))

export const useCheckStore = create<TCheckStore>()(
  persist(
    (...args) => ({
      ...createChecksSlice(...args),
      ...createPeopleSlice(...args),
      ...createItemsSlice(...args),
      ...createPaymentSlice(...args),
    }),
    {
      name: STORAGE_KEYS.CHECKS,
      version: 1,
      merge: (persisted, current) => {
        const safe = (persisted ?? {}) as Partial<TCheckStore>
        const checks = Array.isArray(safe.checks) ? normalizeChecks(safe.checks) : current.checks
        return {
          ...current,
          ...safe,
          checks,
        }
      },
    },
  ),
)
