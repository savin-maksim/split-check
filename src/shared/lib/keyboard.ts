import type { KeyboardEvent } from 'react'

export const createEnterKeyDownHandler =
  (onAction: () => void) =>
  <T extends Element>(e: KeyboardEvent<T>): void => {
    if (e.key !== 'Enter' && e.key !== 'NumpadEnter') return
    e.preventDefault()
    onAction()
  }

export const createKeyboardActivationHandler =
  (onAction: () => void) =>
  <T extends Element>(e: KeyboardEvent<T>): void => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    onAction()
  }
