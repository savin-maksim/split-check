import { PERSON_LIMITS, ITEM_LIMITS } from '@shared/constants'

export const validatePersonName = (name: string): string | null => {
  const trimmed = name.trim()
  if (!trimmed) return 'Имя участника не может быть пустым'
  if (trimmed.length < PERSON_LIMITS.NAME_MIN_LENGTH)
    return `Имя участника должно содержать минимум ${PERSON_LIMITS.NAME_MIN_LENGTH} символа`
  if (trimmed.length > PERSON_LIMITS.NAME_MAX_LENGTH)
    return `Имя участника не может быть длиннее ${PERSON_LIMITS.NAME_MAX_LENGTH} символов`
  return null
}

export const validateItemTitle = (title: string): string | null => {
  const trimmed = title.trim()
  if (!trimmed) return 'Название позиции не может быть пустым'
  if (trimmed.length < ITEM_LIMITS.TITLE_MIN_LENGTH)
    return `Название должно содержать минимум ${ITEM_LIMITS.TITLE_MIN_LENGTH} символа`
  if (trimmed.length > ITEM_LIMITS.TITLE_MAX_LENGTH)
    return `Название не может быть длиннее ${ITEM_LIMITS.TITLE_MAX_LENGTH} символов`
  return null
}

export const validateItemPrice = (price: number): string | null => {
  if (price < ITEM_LIMITS.MIN_PRICE) return 'Цена не может быть отрицательной'
  if (price > ITEM_LIMITS.MAX_PRICE) return 'Цена слишком велика'
  return null
}
