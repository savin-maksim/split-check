/**
 * Карточку участника включаем в экспорт скриншотов, если он платил или участвовал в разделении хотя бы одной позиции.
 * «Пустые» участники (0 ₽ потрачено и ни одной строки в split) в PNG не попадают.
 */
export function personIncludedInStatShare(person) {
  if (!person) return false
  const spent = Number(person.totalAmount) || 0
  const participated = Array.isArray(person.expenses) && person.expenses.length > 0
  return spent > 0 || participated
}
