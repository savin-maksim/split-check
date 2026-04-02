/**
 * Установить paidBy на одного человека (режим "manual")
 * Поведение как в CostCard: заменяет на [person] и сворачивает секцию
 *
 * @param {Object} params
 * @param {Object} params.person - выбранный человек
 * @param {Function} params.onPick - колбек чтобы задать paidBy, принимает [person]
 * @param {Function} [params.onCollapse] - необязательный колбек для сворачивания секции
 */
function togglePaidByManual({ person, onPick, onCollapse }) {
  onPick([person])
  onCollapse?.()
}

export { togglePaidByManual }
