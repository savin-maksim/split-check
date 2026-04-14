type TClassValue = string | boolean | null | undefined

export const cn = (...classes: TClassValue[]): string => classes.filter(Boolean).join(' ')
