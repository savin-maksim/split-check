/**
 * Раскладка тегов на сетке 6 колонок (родитель: `.tag-grid`):
 * span 2 ≈ ⅓, 3 ≈ ½, 6 = полная ширина.
 *
 * @param {number} index — 0-based индекс элемента
 * @param {number} total — число элементов
 * @returns {2 | 3 | 6}
 */
export function getTagColumnSpan(index, total) {
  const n = total
  if (n <= 0) return 2
  const r = n % 3
  if (index < n - r) return 2
  if (r === 1) return 6
  if (r === 2) return 3
  return 2
}

/**
 * Класс модификатора для дочернего элемента `.tag-grid-item--span-{2|3|6}`.
 * @param {number} index
 * @param {number} total
 * @returns {string}
 */
export function getTagGridItemClassName(index, total) {
  return `tag-grid-item--span-${getTagColumnSpan(index, total)}`
}
