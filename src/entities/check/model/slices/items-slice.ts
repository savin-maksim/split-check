import type { StateCreator } from 'zustand'

import type { TCheckStore, TItem } from '../types'
import { updateCheck } from './update-check'

export type TItemsSlice = Pick<
  TCheckStore,
  'addItem' | 'removeItem' | 'removeAllItems' | 'updateItem' | 'duplicateItem'
>

export const createItemsSlice: StateCreator<TCheckStore, [], [], TItemsSlice> = (set, get) => ({
  addItem: (checkId: string, item: Omit<TItem, 'id'>) => {
    const check = get().checks.find((c) => c.id === checkId)
    if (!check) return null
    const newId = check.nextItemId
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => ({
        ...c,
        items: [
          ...c.items,
          {
            ...item,
            id: c.nextItemId,
            paidBySectionExpanded: item.paidBySectionExpanded ?? false,
            splitDistributionWeighted: item.splitDistributionWeighted ?? false,
          },
        ],
        nextItemId: c.nextItemId + 1,
      })),
    }))
    return newId
  },

  removeItem: (checkId: string, itemId: number) => {
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => ({
        ...c,
        items: c.items.filter((i) => i.id !== itemId),
      })),
    }))
  },

  removeAllItems: (checkId: string) => {
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => ({
        ...c,
        items: [],
      })),
    }))
  },

  updateItem: (checkId: string, itemId: number, updates: Partial<TItem>) => {
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => ({
        ...c,
        items: c.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
      })),
    }))
  },

  duplicateItem: (checkId: string, itemId: number) => {
    let newId: number | null = null
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => {
        const idx = c.items.findIndex((i) => i.id === itemId)
        if (idx === -1) return c
        const original = c.items[idx]
        if (!original) return c
        newId = c.nextItemId
        const duplicated: TItem = {
          id: c.nextItemId,
          title: original.title,
          qty: original.qty,
          price: original.price,
          paidBy: 0,
          split: {},
          paidBySectionExpanded: true,
        }
        const items = [...c.items.slice(0, idx + 1), duplicated, ...c.items.slice(idx + 1)]
        return { ...c, items, nextItemId: c.nextItemId + 1 }
      }),
    }))
    return newId
  },
})
