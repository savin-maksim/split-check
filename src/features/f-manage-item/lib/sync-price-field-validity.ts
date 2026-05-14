import { normalizeDecimalInput } from '@shared/lib'

import { calculateExpressionInInput } from './calculate-expression-in-input'

const PRICE_EXPRESSION_PATTERN = /^-?\d+(?:\.\d+)?(?:[+\-*/]-?\d+(?:\.\d+)?)*$/

export const syncPriceFieldValidity = (el: HTMLInputElement): void => {
  const trimmed = el.value.trim()
  if (trimmed.length === 0) {
    el.setCustomValidity(el.value.length > 0 ? 'Введите корректную цену' : '')
    return
  }

  const expression = normalizeDecimalInput(trimmed).replace(/\s+/g, '')

  if (!PRICE_EXPRESSION_PATTERN.test(expression)) {
    el.setCustomValidity('Введите корректную цену')
    return
  }

  const n = calculateExpressionInInput(expression)
  if (Number.isNaN(n) || n < 0) {
    el.setCustomValidity('Введите корректную цену (число не меньше 0)')
    return
  }

  el.setCustomValidity('')
}
