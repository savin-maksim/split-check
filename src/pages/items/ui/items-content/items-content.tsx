import { useCallback, memo } from 'react'
import { Calculator, Trash2 } from 'lucide-react'

import { useCheckStore, EPaymentMode } from '@/entities/check'
import type { TItem, TPerson } from '@/entities/check'
import { FPaymentMode } from '@/features/f-payment-mode'
import { FReceiptScan } from '@/features/f-receipt-scan'
import { PageHeader, PersonGrid, Button, EButtonVariant } from '@/shared/ui'

import { ItemsListWithSearch } from '../items-list-with-search'

type TItemsContentProps = {
  checkId: string
  people: TPerson[]
  items: TItem[]
  paymentMode: EPaymentMode
  singlePayer: number | null
  onEdit: (item: TItem) => void
  onRequestDelete: (item: TItem) => void
  onOpenClearAll: () => void
  onAddBulkItems: (items: Omit<TItem, 'id'>[]) => void
}

export const ItemsContent = memo(
  ({
    checkId,
    people,
    items,
    paymentMode,
    singlePayer,
    onEdit,
    onRequestDelete,
    onOpenClearAll,
    onAddBulkItems,
  }: TItemsContentProps) => {
    const setPaymentMode = useCheckStore((s) => s.setPaymentMode)
    const setSinglePayer = useCheckStore((s) => s.setSinglePayer)

    const handlePaymentModeChange = useCallback(
      (mode: EPaymentMode) => setPaymentMode(checkId, mode),
      [setPaymentMode, checkId],
    )

    const handleSinglePayerSelect = useCallback(
      (person: TPerson) => setSinglePayer(checkId, person.id === singlePayer ? null : person.id),
      [setSinglePayer, checkId, singlePayer],
    )

    return (
      <>
        <PageHeader
          icon={<Calculator size={'var(--header-icon-size)'} aria-hidden="true" />}
          title="Расходы"
          action={
            <Button
              variant={EButtonVariant.Danger}
              onClick={onOpenClearAll}
              title="Удалить все позиции"
              icon={<Trash2 size={'var(--button-icon-size)'} aria-hidden="true" />}
            />
          }
        />

        <div className="p-items__toolbar">
          <FPaymentMode className="grid--span-4" value={paymentMode} onChange={handlePaymentModeChange} />
          <FReceiptScan className="grid--span-4" onAddItems={onAddBulkItems} />
        </div>

        {paymentMode === EPaymentMode.Single && (
          <div className="p-items__single-payer">
            <h3>Выберите плательщика</h3>
            <PersonGrid
              people={people}
              selected={singlePayer != null ? people.filter((p) => p.id === singlePayer) : []}
              onToggle={handleSinglePayerSelect}
            />
          </div>
        )}

        <ItemsListWithSearch
          checkId={checkId}
          people={people}
          items={items}
          paymentMode={paymentMode}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
        />
      </>
    )
  },
)
ItemsContent.displayName = 'ItemsContent'
