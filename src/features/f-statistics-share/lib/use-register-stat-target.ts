import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { useStatShareContext } from '../model'
import type { TStatShareKind, TStatShareTarget } from '../model'

type TUseRegisterStatTargetParams = {
  id: string
  kind: TStatShareKind
  label: string
}

export const useRegisterStatTarget = <T extends HTMLElement = HTMLElement>({
  id,
  kind,
  label,
}: TUseRegisterStatTargetParams): RefObject<T | null> => {
  const ref = useRef<T | null>(null)
  const ctx = useStatShareContext()

  useEffect(() => {
    if (!ctx) return
    const target: TStatShareTarget = { id, kind, label, ref: ref as RefObject<HTMLElement | null> }
    ctx.register(target)
    return () => ctx.unregister(id)
  }, [ctx, id, kind, label])

  return ref
}
