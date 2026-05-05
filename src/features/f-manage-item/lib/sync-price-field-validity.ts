import { normalizeDecimalInput } from '@/shared/lib'

export const syncPriceFieldValidity = (el: HTMLInputElement): void => {
  const trimmed = el.value.trim()
  if (trimmed.length === 0) {
    el.setCustomValidity(el.value.length > 0 ? 'Введите корректную цену' : '')
    return
  }
  const n = parseFloat(normalizeDecimalInput(el.value))
  if (Number.isNaN(n) || n < 0) {
    el.setCustomValidity('Введите корректную цену (число не меньше 0)')
    return
  }
  el.setCustomValidity('')
}
