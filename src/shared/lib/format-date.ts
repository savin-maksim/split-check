const shortFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const longFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export const formatSavedDate = (ts: number): string => shortFormatter.format(ts)

export const formatLongDate = (ts: number): string => longFormatter.format(ts)
