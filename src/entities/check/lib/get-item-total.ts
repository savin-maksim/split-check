import type { TItem } from '../model/types'

export const getItemTotal = (item: TItem): number => item.price * item.qty
