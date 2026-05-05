import { useCallback, useEffect, useRef, useState } from 'react'

export const useDebouncedValue = <T,>(value: T, delayMs: number): readonly [T, () => void] => {
  const [debounced, setDebounced] = useState(value)
  const valueRef = useRef(value)
  valueRef.current = value

  const flush = useCallback(() => {
    setDebounced(valueRef.current)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])

  return [debounced, flush] as const
}
