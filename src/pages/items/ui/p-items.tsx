import { useState, useEffect } from 'react'

import { useCurrentCheck, EPaymentMode } from '@/entities/check'
import type { TItem } from '@/entities/check'
import { FManageItem } from '@/features/f-manage-item'
import { FConfirmDelete } from '@/features/f-confirm-delete'
import { useNavActionStore } from '@/shared/lib'

import { useItemsPageHandlers } from '../lib/use-items-page-handlers'
import { ItemsContent } from './items-content'
import { ItemsEmptyNoItems } from './items-empty-no-items'
import { ItemsEmptyNoPeople } from './items-empty-no-people'

import './p-items.scss'

export const PItems = () => {
  const { check, checkId } = useCurrentCheck()
  const setNavAction = useNavActionStore((s) => s.setOnAction)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<TItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<TItem | null>(null)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)

  const {
    handleAddItem,
    handleEditItem,
    handleAddBulkItems,
    handleClearAll,
    handleConfirmDeleteItem,
    handleOpenClearAll,
  } = useItemsPageHandlers({
    checkId,
    editItem,
    itemToDelete,
    setAddOpen: setIsAddOpen,
    setClearAllOpen: setIsClearAllOpen,
  })

  useEffect(() => {
    setNavAction(() => setIsAddOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])

  const people = check?.people ?? []
  const items = check?.items ?? []
  const paymentMode = check?.paymentMode ?? EPaymentMode.Manual
  const singlePayer = check?.singlePayer ?? null

  const noPeople = people.length === 0
  const noItems = items.length === 0

  if (!check) return null

  return (
    <div className="p-items">
      {noPeople ? (
        <ItemsEmptyNoPeople checkId={checkId} />
      ) : noItems ? (
        <ItemsEmptyNoItems onAddBulkItems={handleAddBulkItems} />
      ) : (
        <ItemsContent
          checkId={checkId}
          people={people}
          items={items}
          paymentMode={paymentMode}
          singlePayer={singlePayer}
          onEdit={setEditItem}
          onRequestDelete={setItemToDelete}
          onOpenClearAll={handleOpenClearAll}
          onAddBulkItems={handleAddBulkItems}
        />
      )}

      {!noPeople && (
        <FManageItem
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          mode="add"
          paymentMode={paymentMode}
          singlePayerId={singlePayer}
          onSubmit={handleAddItem}
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
            onSubmit={handleEditItem}
          />

          <FConfirmDelete
            isOpen={itemToDelete != null}
            onClose={() => setItemToDelete(null)}
            onConfirm={handleConfirmDeleteItem}
            title="Удалить позицию?"
            message={`Позиция «${itemToDelete?.title}» будет удалена без возможности восстановления.`}
          />

          <FConfirmDelete
            isOpen={isClearAllOpen}
            onClose={() => setIsClearAllOpen(false)}
            onConfirm={handleClearAll}
            title="Удалить все позиции?"
            message="Все расходы в текущем чеке будут удалены. Участники останутся. Действие нельзя отменить."
          />
        </>
      )}
    </div>
  )
}
