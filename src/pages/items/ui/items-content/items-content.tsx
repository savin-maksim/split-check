import { AnimatePresence } from 'framer-motion'
import { useCallback, memo } from 'react'
import { Calculator, Trash2 } from 'lucide-react'

import { useCheckStore, EPaymentMode } from '@entities/check'
import type { TItem, TPerson } from '@entities/check'
import { FPaymentMode } from '@features/f-payment-mode'
import { FReceiptScan } from '@features/f-receipt-scan'
import { PageHeader, PersonGrid, Button, EButtonVariant, AnimatedBlock } from '@shared/ui'
import { animatedBlockMotion, animatedBlockMotionPop } from '@shared/lib'

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
          icon={<Calculator aria-hidden="true" size={'var(--header-icon-size)'} />}
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

        <AnimatedBlock className="p-items__toolbar" blockMotion={animatedBlockMotion}>
          <FPaymentMode value={paymentMode} onChange={handlePaymentModeChange} />
          <FReceiptScan onAddItems={onAddBulkItems} />
        </AnimatedBlock>

        <AnimatePresence mode="popLayout">
          {paymentMode === EPaymentMode.Single && (
            <AnimatedBlock
              key="p-items-single-payer"
              className="p-items__single-payer"
              blockMotion={animatedBlockMotionPop}
            >
              <h3>Выберите плательщика</h3>
              <PersonGrid
                people={people}
                selected={singlePayer != null ? people.filter((p) => p.id === singlePayer) : []}
                onToggle={handleSinglePayerSelect}
              />
            </AnimatedBlock>
          )}
        </AnimatePresence>

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
