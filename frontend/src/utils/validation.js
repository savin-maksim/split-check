export const validatePerson = (person) => {
  if (!person) {
    throw new Error('Данные участника не могут быть пустыми')
  }

  if (!person.name?.trim()) {
    throw new Error('Имя участника не может быть пустым')
  }

  if (person.name.length < 2) {
    throw new Error('Имя участника должно содержать минимум 2 символа')
  }

  if (person.name.length > 50) {
    throw new Error('Имя участника не может быть длиннее 50 символов')
  }
}

export const validateCost = (cost) => {
  if (!cost) {
    throw new Error('Данные расхода не могут быть пустыми')
  }

  if (!cost.title?.trim()) {
    throw new Error('Название расхода не может быть пустым')
  }

  if (cost.title.length < 2) {
    throw new Error('Название расхода должно содержать минимум 2 символа')
  }

  if (cost.title.length > 100) {
    throw new Error('Название расхода не может быть длиннее 100 символов')
  }

  if (!cost.amount || cost.amount <= 0) {
    throw new Error('Сумма расхода должна быть больше нуля')
  }

  if (cost.amount > 1000000) {
    throw new Error('Сумма расхода не может быть больше 1 000 000')
  }

  if (cost.quantity && cost.quantity <= 0) {
    throw new Error('Количество должно быть больше нуля')
  }

  if (cost.pricePerUnit && cost.pricePerUnit <= 0) {
    throw new Error('Цена за единицу должна быть больше нуля')
  }
} 