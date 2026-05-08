export type TPerson = {
  id: number
  name: string
}

export type TItem = {
  id: number
  title: string
  qty: number
  price: number
  paidBy: number
  split: Record<number, number>
  paidBySectionExpanded?: boolean
  splitDistributionWeighted?: boolean
}

export enum EPaymentMode {
  Manual = 'manual',
  Single = 'single',
}

export type TCheck = {
  id: string
  title: string
  createdAt: number
  paymentMode: EPaymentMode
  singlePayer: number | null
  nextPersonId: number
  nextItemId: number
  people: TPerson[]
  items: TItem[]
}

export type TTransfer = {
  from: string
  to: string
  amount: number
}

export type TCheckStore = {
  checks: TCheck[]
  currentCheckId: string | null

  addCheck: (title: string) => string
  removeCheck: (checkId: string) => void
  updateCheckTitle: (checkId: string, title: string) => void
  loadCheck: (checkId: string) => void

  addPerson: (checkId: string, name: string) => void
  addPeople: (checkId: string, names: string[]) => void
  removePerson: (checkId: string, personId: number) => void
  removeAllPeople: (checkId: string) => void
  updatePerson: (checkId: string, personId: number, name: string) => boolean

  addItem: (checkId: string, item: Omit<TItem, 'id'>) => number | null
  removeItem: (checkId: string, itemId: number) => void
  removeAllItems: (checkId: string) => void
  updateItem: (checkId: string, itemId: number, item: Partial<TItem>) => void
  duplicateItem: (checkId: string, itemId: number) => number | null

  setPaymentMode: (checkId: string, mode: EPaymentMode) => void
  setSinglePayer: (checkId: string, personId: number | null) => void
}
