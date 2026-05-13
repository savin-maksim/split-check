import type { StateCreator } from 'zustand'

import { formatPersonName } from '@shared/lib/parse-names'

import { validatePersonName } from '@entities/check'
import type { TAddPeopleResult, TCheckStore, TPersonActionResult } from '../types'
import { updateCheck } from './update-check'

const CHECK_NOT_FOUND_ERROR = 'Чек не найден'
const DUPLICATE_PERSON_ERROR = 'Участник с таким именем уже есть'
const ADD_PEOPLE_ERROR = 'Не удалось добавить участников'

export type TPeopleSlice = Pick<
  TCheckStore,
  'addPerson' | 'addPeople' | 'removePerson' | 'removeAllPeople' | 'updatePerson'
>

const failPersonAction = (error: string): TPersonActionResult => ({ ok: false, error })

export const createPeopleSlice: StateCreator<TCheckStore, [], [], TPeopleSlice> = (set, get) => ({
  addPerson: (checkId: string, name: string) => {
    const check = get().checks.find((c) => c.id === checkId)
    if (!check) return failPersonAction(CHECK_NOT_FOUND_ERROR)

    const formatted = formatPersonName(name)
    const validationError = validatePersonName(formatted)
    if (validationError) return failPersonAction(validationError)

    const duplicate = check.people.some((p) => p.name.toLowerCase() === formatted.toLowerCase())
    if (duplicate) return failPersonAction(DUPLICATE_PERSON_ERROR)

    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => {
        return {
          ...c,
          people: [...c.people, { id: c.nextPersonId, name: formatted }],
          nextPersonId: c.nextPersonId + 1,
        }
      }),
    }))
    return { ok: true }
  },

  addPeople: (checkId: string, names: string[]) => {
    const check = get().checks.find((c) => c.id === checkId)
    if (!check) {
      return {
        ok: false,
        addedCount: 0,
        skippedCount: names.length,
        error: CHECK_NOT_FOUND_ERROR,
      }
    }

    let result: TAddPeopleResult = {
      ok: false,
      addedCount: 0,
      skippedCount: 0,
      error: ADD_PEOPLE_ERROR,
    }

    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => {
        let nextId = c.nextPersonId
        const existingNames = new Set(c.people.map((p) => p.name.toLowerCase()))
        const newPeople = []
        let skippedCount = 0
        let firstError: string | undefined

        for (const rawName of names) {
          const name = formatPersonName(rawName)
          const validationError = validatePersonName(name)

          if (validationError) {
            skippedCount++
            firstError ??= validationError
            continue
          }

          const normalizedName = name.toLowerCase()
          if (existingNames.has(normalizedName)) {
            skippedCount++
            firstError ??= DUPLICATE_PERSON_ERROR
            continue
          }

          existingNames.add(normalizedName)
          newPeople.push({ id: nextId, name })
          nextId++
        }

        result = {
          ok: newPeople.length > 0,
          addedCount: newPeople.length,
          skippedCount,
          error: newPeople.length > 0 ? undefined : (firstError ?? ADD_PEOPLE_ERROR),
        }

        return {
          ...c,
          people: [...c.people, ...newPeople],
          nextPersonId: nextId,
        }
      }),
    }))
    return result
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
    if (!check) return failPersonAction(CHECK_NOT_FOUND_ERROR)

    const formatted = formatPersonName(name)
    const validationError = validatePersonName(formatted)
    if (validationError) return failPersonAction(validationError)

    const duplicate = check.people.some((p) => p.id !== personId && p.name.toLowerCase() === formatted.toLowerCase())
    if (duplicate) return failPersonAction(DUPLICATE_PERSON_ERROR)

    set((s) => ({
      checks: updateCheck(s.checks, checkId, (c) => ({
        ...c,
        people: c.people.map((p) => (p.id === personId ? { ...p, name: formatted } : p)),
      })),
    }))
    return { ok: true }
  },
})
