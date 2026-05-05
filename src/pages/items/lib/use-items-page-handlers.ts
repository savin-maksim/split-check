import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

import { useCheckStore } from '@/entities/check'
import type { TItem } from '@/entities/check'
import { scrollToItemAnchor } from '@/shared/lib'

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
      const newId = addItem(checkId, { ...item, paidBySectionExpanded: true })
      if (newId != null) {
        const rawIdx =
          useCheckStore.getState().checks.find((c) => c.id === checkId)?.items.findIndex((i) => i.id === newId) ?? -1
        const listItemIndex = Math.max(0, rawIdx)
        scrollToItemAnchor(checkId, newId, { listItemIndex })
      }
      toast.success(`Добавлено: ${item.title}`)
      setAddOpen(false)
    },
    [addItem, checkId, setAddOpen],
  )

  const handleEditItem = useCallback(
    (item: Omit<TItem, 'id'>) => {
      if (!editItem) return
      useCheckStore.getState().updateItem(checkId, editItem.id, item)
      toast.success(`Обновлено: ${editItem.title}`)
    },
    [editItem, checkId],
  )

  const handleAddBulkItems = useCallback(
    (newItems: Omit<TItem, 'id'>[]) => {
      const n = newItems.length
      let lastId: number | null = null
      newItems.forEach((entry, i) => {
        const id = addItem(checkId, {
          ...entry,
          paidBySectionExpanded: entry.paidBySectionExpanded ?? i === n - 1,
        })
        if (id != null) lastId = id
      })
      if (lastId != null) {
        const rawIdx =
          useCheckStore.getState().checks.find((c) => c.id === checkId)?.items.findIndex((i) => i.id === lastId) ?? -1
        const listItemIndex = Math.max(0, rawIdx)
        scrollToItemAnchor(checkId, lastId, { listItemIndex })
      }
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
    toast.success(`Удалено: ${itemToDelete.title}`)
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
