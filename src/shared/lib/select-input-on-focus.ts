import type { FocusEvent } from 'react'

export const selectInputOnFocus = (
  e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
): void => {
  e.currentTarget.select()
}
