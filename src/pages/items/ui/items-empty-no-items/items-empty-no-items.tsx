import { Calculator } from 'lucide-react'

import type { TItem } from '@entities/check'
import { FReceiptScan, GeminiText } from '@features/f-receipt-scan'
import { WPageEmpty } from '@widgets/w-page-empty'

type TItemsEmptyNoItemsProps = {
  onAddBulkItems: (items: Omit<TItem, 'id'>[]) => void
}

export const ItemsEmptyNoItems = ({ onAddBulkItems }: TItemsEmptyNoItemsProps) => (
  <WPageEmpty
    pageTitle="Расходы"
    pageIcon={<Calculator size={'var(--header-icon-size)'} aria-hidden="true" />}
    emptyIcon={<Calculator size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
    emptyTitle="Добавьте расходы"
    actions={<FReceiptScan onAddItems={onAddBulkItems} />}
  >
    <p>Нажмите на кнопку в навигационной панели, чтобы добавить расходы</p>
    <p>
      Или воспользуйтесь <GeminiText>ИИ распознованием</GeminiText>
    </p>
  </WPageEmpty>
)
