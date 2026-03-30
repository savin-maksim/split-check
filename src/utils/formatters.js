export const formatAmount = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatQuantity = (quantity, splitCount) => {
  if (!quantity || !splitCount) return '1'

  // If quantity divides evenly by split count
  if (quantity % splitCount === 0) {
    return (quantity / splitCount).toString()
  }

  // Otherwise show fraction: quantity/split_count
  return `${quantity}/${splitCount}`
}

export const formatTotalQuantity = (quantity) => {
  if (!quantity) return '1'
  return quantity.toString()
}

export const formatPersonName = (name) => {
  return name.trim().charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

export const formatCostTitle = (title) => {
  return title.trim().charAt(0).toUpperCase() + title.slice(1)
}
