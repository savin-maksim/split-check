import { Calculator } from 'lucide-react'

import type { TItem } from '@/entities/check'
import { FReceiptScan } from '@/features/f-receipt-scan'
import { PageHeader, EmptyState } from '@/shared/ui'

type TItemsEmptyNoItemsProps = {
  onAddBulkItems: (items: Omit<TItem, 'id'>[]) => void
}

export const ItemsEmptyNoItems = ({ onAddBulkItems }: TItemsEmptyNoItemsProps) => (
  <>
    <PageHeader icon={<Calculator size={'var(--header-icon-size)'} aria-hidden="true" />} title="Расходы" />
    <EmptyState
      icon={<Calculator size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
      title="Добавьте расходы"
      actions={<FReceiptScan onAddItems={onAddBulkItems} />}
    >
      <p>Нажмите на кнопку в навигационной панели, чтобы добавить расходы</p>
      <p>
        Или воспользуйтесь <span className="gemini-gradient">ИИ распознованием</span>
      </p>
    </EmptyState>
  </>
)
