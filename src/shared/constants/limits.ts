export const PERSON_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const

export const ITEM_LIMITS = {
  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 100,
  MAX_PRICE: 100_000_000,
  MIN_PRICE: 0,
  MIN_QTY: 1,
} as const
