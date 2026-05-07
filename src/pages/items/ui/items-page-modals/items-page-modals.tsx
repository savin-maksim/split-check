import type { EPaymentMode, TItem } from '@/entities/check'
import { FManageItem } from '@/features/f-manage-item'
import { FConfirmDelete } from '@/features/f-confirm-delete'

type TItemsPageModalsProps = {
  isAddOpen: boolean
  setIsAddOpen: (open: boolean) => void
  editItem: TItem | null
  setEditItem: (item: TItem | null) => void
  itemToDelete: TItem | null
  setItemToDelete: (item: TItem | null) => void
  isClearAllOpen: boolean
  setIsClearAllOpen: (open: boolean) => void
  noPeople: boolean
  noItems: boolean
  paymentMode: EPaymentMode
  singlePayer: number | null
  onAddItem: (item: Omit<TItem, 'id'>) => void
  onEditItem: (item: Omit<TItem, 'id'>) => void
  onConfirmDeleteItem: () => void
  onClearAll: () => void
}

export const ItemsPageModals = ({
  isAddOpen,
  setIsAddOpen,
  editItem,
  setEditItem,
  itemToDelete,
  setItemToDelete,
  isClearAllOpen,
  setIsClearAllOpen,
  noPeople,
  noItems,
  paymentMode,
  singlePayer,
  onAddItem,
  onEditItem,
  onConfirmDeleteItem,
  onClearAll,
}: TItemsPageModalsProps) => (
  <>
    {!noPeople && (
      <FManageItem
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        mode="add"
        paymentMode={paymentMode}
        singlePayerId={singlePayer}
        onSubmit={onAddItem}
      />
    )}

    {!noPeople && !noItems && (
      <>
        <FManageItem
          isOpen={editItem != null}
          onClose={() => setEditItem(null)}
          mode="edit"
          initialData={editItem ?? undefined}
          paymentMode={paymentMode}
          singlePayerId={singlePayer}
          onSubmit={onEditItem}
        />

        <FConfirmDelete
          isOpen={itemToDelete != null}
          onClose={() => setItemToDelete(null)}
          onConfirm={onConfirmDeleteItem}
          title="Удалить позицию?"
          message={`Позиция «${itemToDelete?.title}» будет удалена без возможности восстановления.`}
        />

        <FConfirmDelete
          isOpen={isClearAllOpen}
          onClose={() => setIsClearAllOpen(false)}
          onConfirm={onClearAll}
          title="Удалить все позиции?"
          message="Все расходы в текущем чеке будут удалены. Участники останутся. Действие нельзя отменить."
        />
      </>
    )}
  </>
)
