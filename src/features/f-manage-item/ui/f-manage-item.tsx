import { Modal } from '@/shared/ui'
import type { EPaymentMode, TItem } from '@/entities/check'

import { ManageItemForm } from './manage-item-form'

type TFManageItemProps = {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  initialData?: Partial<TItem>
  initialFocus?: 'title' | 'price'
  paymentMode: EPaymentMode
  singlePayerId?: number | null
  onSubmit: (item: Omit<TItem, 'id'>) => void
}

export const FManageItem = ({
  isOpen,
  onClose,
  mode,
  initialData,
  initialFocus,
  paymentMode,
  singlePayerId,
  onSubmit,
}: TFManageItemProps) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ManageItemForm
      mode={mode}
      isOpen={isOpen}
      initialData={initialData}
      initialFocus={initialFocus}
      paymentMode={paymentMode}
      singlePayerId={singlePayerId}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  </Modal>
)
