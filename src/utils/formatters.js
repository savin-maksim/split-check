const formatters = {
  /** Строка для parseFloat: запятые как десятичный разделитель → точки */
  normalizeDecimalInput(raw) {
    return String(raw ?? '').replace(/,/g, '.')
  },

  formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      style: 'currency',
      currency: 'RUB',
    }).format(amount)
  },

  formatQuantity(quantity, splitCount) {
    if (!quantity || !splitCount) return '1'
    if (quantity % splitCount === 0) {
      return (quantity / splitCount).toString()
    }
    return `${quantity}/${splitCount}`
  },

  formatTotalQuantity(quantity) {
    if (!quantity) return '1'
    return quantity.toString()
  },

  formatPersonName(name) {
    return name.trim().charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  },

  formatCostTitle(title) {
    return title.trim().charAt(0).toUpperCase() + title.slice(1)
  },

  pluralize(n, [one, few, many]) {
    const n100 = n % 100
    if (n100 >= 11 && n100 <= 14) return many
    const n10 = n % 10
    if (n10 === 1) return one
    if (n10 >= 2 && n10 <= 4) return few
    return many
  },

  formatSavedDate(ts) {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(ts)
  },
}

export default formatters
