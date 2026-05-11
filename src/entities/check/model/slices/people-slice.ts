import type { StateCreator } from 'zustand'

import { formatPersonName } from '@/shared/lib/parse-names'

import type { TCheckStore } from '../types'
import { updateCheck } from './update-check'

export type TPeopleSlice = Pick<
  TCheckStore,
  'addPerson' | 'addPeople' | 'removePerson' | 'removeAllPeople' | 'updatePerson'
>

export const createPeopleSlice: StateCreator<TCheckStore, [], [], TPeopleSlice> = (set, get) => ({
  addPerson: (checkId: string, name: string) => {
    const check = get().checks.find((c) => c.id === checkId)
    if (!check) return false

    const formatted = formatPersonName(name)
    const duplicate = check.people.some((p) => p.name.toLowerCase() === formatted.toLowerCase())
    if (duplicate) return false

    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => {
        return {
          ...c,
          people: [...c.people, { id: c.nextPersonId, name: formatted }],
          nextPersonId: c.nextPersonId + 1,
        }
      }),
    }))
    return true
  },

  addPeople: (checkId: string, names: string[]) => {
    let addedCount = 0

    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => {
        let nextId = c.nextPersonId
        const existingNames = new Set(c.people.map((p) => p.name.toLowerCase()))
        const newPeople = names
          .map((n) => formatPersonName(n))
          .filter((n) => n.length >= 2 && !existingNames.has(n.toLowerCase()))
          .map((name) => {
            const person = { id: nextId, name }
            nextId++
            return person
          })
        addedCount = newPeople.length
        return {
          ...c,
          people: [...c.people, ...newPeople],
          nextPersonId: nextId,
        }
      }),
    }))
    return addedCount
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
                paidBy: item.paidBy === personId ? 0 : item.paidBy,
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
    const formatted = formatPersonName(name)
    const duplicate = check.people.some((p) => p.id !== personId && p.name.toLowerCase() === formatted.toLowerCase())
    if (duplicate) return false
    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => ({
        ...c,
        people: c.people.map((p) => (p.id === personId ? { ...p, name: formatted } : p)),
      })),
    }))
    return true
  },
})
