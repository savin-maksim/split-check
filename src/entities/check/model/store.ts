import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { generateId } from '@/shared/lib'

import type { TCheck, TCheckStore, TItem } from './types'
import { EPaymentMode } from './types'

const updateCheck = (checks: TCheck[], checkId: string, updater: (check: TCheck) => TCheck): TCheck[] =>
  checks.map((c) => (c.id === checkId ? updater(c) : c))

export const useCheckStore = create<TCheckStore>()(
  persist(
    (set, get) => ({
      checks: [],
      currentCheckId: null,

      addCheck: (title: string) => {
        const id = generateId()
        const check: TCheck = {
          id,
          title: title.trim() || 'Без названия',
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
            title: title.trim() || 'Без названия',
          })),
        }))
      },

      setCurrentCheck: (checkId: string | null) => {
        set({ currentCheckId: checkId })
      },

      loadCheck: (checkId: string) => {
        set({ currentCheckId: checkId })
      },

      addPerson: (checkId: string, name: string) => {
        set((s) => ({
          checks: updateCheck(s.checks, checkId, (c) => {
            const trimmed = name.trim()
            const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
            const duplicate = c.people.some((p) => p.name.toLowerCase() === formatted.toLowerCase())
            if (duplicate) return c
            return {
              ...c,
              people: [...c.people, { id: c.nextPersonId, name: formatted }],
              nextPersonId: c.nextPersonId + 1,
            }
          }),
        }))
      },

      addPeople: (checkId: string, names: string[]) => {
        set((s) => ({
          checks: updateCheck(s.checks, checkId, (c) => {
            let nextId = c.nextPersonId
            const existingNames = new Set(c.people.map((p) => p.name.toLowerCase()))
            const newPeople = names
              .map((n) => {
                const trimmed = n.trim()
                return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
              })
              .filter((n) => n.length >= 2 && !existingNames.has(n.toLowerCase()))
              .map((name) => {
                const person = { id: nextId, name }
                nextId++
                return person
              })
            return {
              ...c,
              people: [...c.people, ...newPeople],
              nextPersonId: nextId,
            }
          }),
        }))
      },

      removePerson: (checkId: string, personId: number) => {
        set((s) => ({
          checks: updateCheck(s.checks, checkId, (c) => {
            const newPeople = c.people.filter((p) => p.id !== personId)
            const newItems =
              newPeople.length === 0
                ? []
                : c.items.map((item) => ({
                    ...item,
                    paidBy: item.paidBy.filter((id) => id !== personId),
                    split: Object.fromEntries(Object.entries(item.split).filter(([key]) => Number(key) !== personId)),
                  }))
            return {
              ...c,
              people: newPeople,
              items: newItems,
              singlePayer: c.singlePayer === personId ? null : c.singlePayer,
            }
          }),
        }))
      },

      removeAllPeople: (checkId: string) => {
        set((s) => ({
          checks: updateCheck(s.checks, checkId, (c) => ({
            ...c,
            people: [],
            items: [],
            singlePayer: null,
          })),
        }))
      },

      updatePerson: (checkId: string, personId: number, name: string) => {
        const check = get().checks.find((c) => c.id === checkId)
        if (!check) return false
        const trimmed = name.trim()
        const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
        const duplicate = check.people.some(
          (p) => p.id !== personId && p.name.toLowerCase() === formatted.toLowerCase(),
        )
        if (duplicate) return false
        set((s) => ({
          checks: updateCheck(s.checks, checkId, (c) => ({
            ...c,
            people: c.people.map((p) => (p.id === personId ? { ...p, name: formatted } : p)),
          })),
        }))
        return true
      },

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
        set((s) => ({
          checks: updateCheck(s.checks, checkId, (c) => {
            const idx = c.items.findIndex((i) => i.id === itemId)
            if (idx === -1) return c
            const original = c.items[idx]
            if (!original) return c
            const newItem: TItem = { ...original, id: c.nextItemId }
            const newItems = [...c.items]
            newItems.splice(idx + 1, 0, newItem)
            return { ...c, items: newItems, nextItemId: c.nextItemId + 1 }
          }),
        }))
      },

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
    }),
    {
      name: 'split-check-storage',
      version: 1,
    },
  ),
)
