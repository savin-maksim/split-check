/** Детерминированный хэш строки (djb2) */
export function hashString(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33 + str.charCodeAt(i)) >>> 0
  }
  return String(hash)
}

/** Хэш только людей и расходов — влияет на статистику и базовые ожидания */
export function computeDataFingerprint(people, costs) {
  return hashString(JSON.stringify({ people, costs }))
}

/** Полный ключ: данные + режим оплаты (переводы) */
export function computeFullFingerprint(dataFingerprint, paymentMode, singlePayer) {
  return hashString(`${dataFingerprint}|${paymentMode}|${singlePayer?.id ?? ''}`)
}
