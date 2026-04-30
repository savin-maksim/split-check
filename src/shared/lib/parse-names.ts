export const formatPersonName = (name: string): string => {
  const trimmed = name.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

export const formatItemTitle = (title: string): string => {
  const trimmed = title.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export const normalizeDecimalInput = (raw: string): string => String(raw ?? '').replace(/,/g, '.')

export const parseBulkPersonNames = (raw: string): string[] =>
  raw
    .split(',')
    .map((n) => n.trim())
    .filter((n) => n.length > 0)
