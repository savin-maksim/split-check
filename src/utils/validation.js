import { VALIDATION_RULES } from './constants'

export const validatePerson = (person) => {
  if (!person) {
    throw new Error('Данные участника не могут быть пустыми')
  }

  if (!person.name?.trim()) {
    throw new Error('Имя участника не может быть пустым')
  }

  if (person.name.length < VALIDATION_RULES.PERSON.NAME_MIN_LENGTH) {
    throw new Error(`Имя участника должно содержать минимум ${VALIDATION_RULES.PERSON.NAME_MIN_LENGTH} символа`)
  }

  if (person.name.length > VALIDATION_RULES.PERSON.NAME_MAX_LENGTH) {
    throw new Error(`Имя участника не может быть длиннее ${VALIDATION_RULES.PERSON.NAME_MAX_LENGTH} символов`)
  }
}

export const validateCost = (cost) => {
  if (!cost) {
    throw new Error('Данные расхода не могут быть пустыми')
  }

  if (!cost.title?.trim()) {
    throw new Error('Название расхода не может быть пустым')
  }

  if (cost.title.length < VALIDATION_RULES.COST.TITLE_MIN_LENGTH) {
    throw new Error(`Название расхода должно содержать минимум ${VALIDATION_RULES.COST.TITLE_MIN_LENGTH} символа`)
  }

  if (cost.title.length > VALIDATION_RULES.COST.TITLE_MAX_LENGTH) {
    throw new Error(`Название расхода не может быть длиннее ${VALIDATION_RULES.COST.TITLE_MAX_LENGTH} символов`)
  }

  // Allow 0 amount for gifts/free items
  if (cost.amount === undefined || cost.amount === null || cost.amount < VALIDATION_RULES.COST.MIN_AMOUNT) {
    throw new Error('Сумма расхода не может быть отрицательной')
  }

  if (cost.amount > VALIDATION_RULES.COST.MAX_AMOUNT) {
    throw new Error(`Сумма расхода не может быть больше ${VALIDATION_RULES.COST.MAX_AMOUNT.toLocaleString('ru-RU')}`)
  }

  if (cost.quantity && cost.quantity <= 0) {
    throw new Error('Количество должно быть больше нуля')
  }

  if (cost.pricePerUnit !== undefined && cost.pricePerUnit < 0) {
    throw new Error('Цена за единицу не может быть отрицательной')
  }

  if (cost.distributionType === 'weighted') {
    const total = Object.values(cost.weights || {}).reduce(
      (s, u) => s + Math.max(0, Math.floor(Number(u) || 0)),
      0
    )
    if (total <= 0) {
      throw new Error('Укажите хотя бы одну долю больше нуля')
    }
  }
} 