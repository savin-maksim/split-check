const formatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  style: 'currency',
  currency: 'RUB',
})

export const formatMoney = (kopecks: number): string => formatter.format(kopecks / 100)

export const formatMoneyRaw = (amount: number): string => formatter.format(amount)
