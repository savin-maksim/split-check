import { useCallback, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'

import {
  StatShareContext,
  type TStatShareContextValue,
  type TStatShareTarget,
} from './stat-share-context-value'

type TStatShareProviderProps = {
  children: ReactNode
}

export const StatShareProvider = ({ children }: TStatShareProviderProps) => {
  const targetsRef = useRef<Map<string, TStatShareTarget>>(new Map())

  const register = useCallback((target: TStatShareTarget) => {
    targetsRef.current.set(target.id, target)
  }, [])

  const unregister = useCallback((id: string) => {
    targetsRef.current.delete(id)
  }, [])

  const list = useCallback(() => Array.from(targetsRef.current.values()), [])

  const value = useMemo<TStatShareContextValue>(
    () => ({ register, unregister, list }),
    [register, unregister, list],
  )

  return <StatShareContext.Provider value={value}>{children}</StatShareContext.Provider>
}
