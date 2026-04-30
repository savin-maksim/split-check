import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

import { useCheckStore } from '@/entities/check'
import type { TItem } from '@/entities/check'

type TUseItemsPageHandlersParams = {
  checkId: string
  editItem: TItem | null
  itemToDelete: TItem | null
  setAddOpen: (open: boolean) => void
  setClearAllOpen: (open: boolean) => void
}

export const useItemsPageHandlers = ({
  checkId,
  editItem,
  itemToDelete,
  setAddOpen,
  setClearAllOpen,
}: TUseItemsPageHandlersParams) => {
  const addItem = useCheckStore((s) => s.addItem)
  const removeItem = useCheckStore((s) => s.removeItem)
  const removeAllItems = useCheckStore((s) => s.removeAllItems)

  const handleAddItem = useCallback(
    (item: Omit<TItem, 'id'>) => {
      addItem(checkId, { ...item, paidBySectionExpanded: true })
      toast.success('Позиция добавлена')
      setAddOpen(false)
    },
    [addItem, checkId, setAddOpen],
  )

  const handleEditItem = useCallback(
    (item: Omit<TItem, 'id'>) => {
      if (!editItem) return
      useCheckStore.getState().updateItem(checkId, editItem.id, item)
      toast.success('Позиция обновлена')
    },
    [editItem, checkId],
  )

  const handleAddBulkItems = useCallback(
    (newItems: Omit<TItem, 'id'>[]) => {
      const n = newItems.length
      newItems.forEach((entry, i) => {
        addItem(checkId, {
          ...entry,
          paidBySectionExpanded: entry.paidBySectionExpanded ?? i === n - 1,
        })
      })
    },
    [addItem, checkId],
  )

  const handleClearAll = useCallback(() => {
    removeAllItems(checkId)
    toast.success('Все позиции удалены')
  }, [removeAllItems, checkId])

  const handleConfirmDeleteItem = useCallback(() => {
    if (!itemToDelete) return
    removeItem(checkId, itemToDelete.id)
    toast.success('Позиция удалена')
  }, [itemToDelete, removeItem, checkId])

  const handleOpenClearAll = useCallback(() => {
    setClearAllOpen(true)
  }, [setClearAllOpen])

  return {
    handleAddItem,
    handleEditItem,
    handleAddBulkItems,
    handleClearAll,
    handleConfirmDeleteItem,
    handleOpenClearAll,
  }
}
