import type { TItem } from '@/entities/check'
import { formatItemTitle } from '@/shared/lib'

import type { TPreviewQuantities, TScannedItem } from '../model'

type TBuildScannedItemsParams = {
  scannedItems: TScannedItem[]
  selectedIndexes: Set<number>
  quantities: TPreviewQuantities
}

export const buildScannedItems = ({
  scannedItems,
  selectedIndexes,
  quantities,
}: TBuildScannedItemsParams): Omit<TItem, 'id'>[] => {
  return scannedItems
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => selectedIndexes.has(index))
    .map(({ item, index }) => ({
      title: formatItemTitle(item.title),
      price: Math.round(item.price * 100),
      qty: Math.max(1, (quantities[index] ?? item.qty) || 1),
      paidBy: 0,
      split: {},
      paidBySectionExpanded: true,
    }))
}
