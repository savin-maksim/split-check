import { createContext } from 'react'
import type { RefObject } from 'react'

export type TStatShareKind = 'summary' | 'person' | 'transfers'

export type TStatShareTarget = {
  id: string
  kind: TStatShareKind
  label: string
  ref: RefObject<HTMLElement | null>
}

export type TStatShareContextValue = {
  register: (target: TStatShareTarget) => void
  unregister: (id: string) => void
  list: () => TStatShareTarget[]
}

export const StatShareContext = createContext<TStatShareContextValue | null>(null)
