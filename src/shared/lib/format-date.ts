const shortFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const formatSavedDate = (ts: number): string => shortFormatter.format(ts)
