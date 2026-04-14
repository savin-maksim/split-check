export const pluralize = (n: number, forms: [string, string, string]): string => {
  const [one, few, many] = forms
  const n100 = n % 100
  if (n100 >= 11 && n100 <= 14) return many
  const n10 = n % 10
  if (n10 === 1) return one
  if (n10 >= 2 && n10 <= 4) return few
  return many
}
