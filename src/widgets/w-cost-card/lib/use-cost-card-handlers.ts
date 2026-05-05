import { useCallback } from 'react'

import toast from 'react-hot-toast'

import type { TItem, TPerson } from '@/entities/check'
import { EPaymentMode, isSplitDistributionWeightedView, useCheckStore } from '@/entities/check'

import { scrollToItemAnchor } from '@/shared/lib'

type TUseCostCardHandlersParams = {
  checkId: string
  item: TItem
  people: TPerson[]
  paymentMode: EPaymentMode
  onEdit: (item: TItem) => void
  onDelete: (item: TItem) => void
}

export const useCostCardHandlers = ({
  checkId,
  item,
  people,
  paymentMode,
  onEdit,
  onDelete,
}: TUseCostCardHandlersParams) => {
  const updateItem = useCheckStore((s) => s.updateItem)
  const duplicateItem = useCheckStore((s) => s.duplicateItem)

  const paidByExpanded = item.paidBySectionExpanded ?? false

  const handleTogglePaidByExpanded = useCallback(() => {
    if (paymentMode === EPaymentMode.Single) return
    updateItem(checkId, item.id, {
      paidBySectionExpanded: !paidByExpanded,
    })
  }, [checkId, item.id, paidByExpanded, paymentMode, updateItem])

  const handlePersonPaidToggle = useCallback(
    (person: TPerson) => {
      if (paymentMode === EPaymentMode.Single) return
      updateItem(checkId, item.id, { paidBy: [person.id], paidBySectionExpanded: false })
    },
    [checkId, item.id, paymentMode, updateItem],
  )

  const handleSplitPersonToggle = useCallback(
    (person: TPerson) => {
      const current = item.split[person.id] ?? 0
      updateItem(checkId, item.id, {
        split: { ...item.split, [person.id]: current > 0 ? 0 : 1 },
      })
    },
    [checkId, item.id, item.split, updateItem],
  )

  const handleToggleDistribution = useCallback(() => {
    if (isSplitDistributionWeightedView(item)) {
      const newSplit: Record<number, number> = {}
      for (const p of people) {
        newSplit[p.id] = (item.split[p.id] ?? 0) > 0 ? 1 : 0
      }
      updateItem(checkId, item.id, {
        split: newSplit,
        splitDistributionWeighted: false,
      })
    } else {
      updateItem(checkId, item.id, { splitDistributionWeighted: true })
    }
  }, [checkId, item.id, item, people, updateItem])

  const handleSelectAllSplit = useCallback(() => {
    if (people.length === 0) return
    const newSplit: Record<number, number> = { ...item.split }
    for (const p of people) {
      newSplit[p.id] = Math.max(1, item.split[p.id] ?? 0)
    }
    updateItem(checkId, item.id, { split: newSplit })
  }, [checkId, item.id, item.split, people, updateItem])

  const handleAdjustWeight = useCallback(
    (personId: number, delta: number) => {
      const current = item.split[personId] ?? 0
      updateItem(checkId, item.id, {
        split: { ...item.split, [personId]: Math.max(0, current + delta) },
      })
    },
    [checkId, item.id, item.split, updateItem],
  )

  const handleAdjustQty = useCallback(
    (delta: number) => {
      const newQty = Math.max(1, item.qty + delta)
      updateItem(checkId, item.id, { qty: newQty })
    },
    [checkId, item.id, item.qty, updateItem],
  )

  const handleDuplicate = useCallback(() => {
    const newId = duplicateItem(checkId, item.id)
    if (newId != null) {
      const rawIdx =
        useCheckStore.getState().checks.find((c) => c.id === checkId)?.items.findIndex((i) => i.id === newId) ?? -1
      const listItemIndex = Math.max(0, rawIdx)
      scrollToItemAnchor(checkId, newId, { listItemIndex })
    }
    toast.success(`Дублировано: ${item.title}`)
  }, [checkId, item.id, duplicateItem, item.title])

  const handleEdit = useCallback(() => onEdit(item), [onEdit, item])

  const handleDelete = useCallback(() => onDelete(item), [onDelete, item])

  return {
    handleTogglePaidByExpanded,
    handlePersonPaidToggle,
    handleSplitPersonToggle,
    handleToggleDistribution,
    handleSelectAllSplit,
    handleAdjustWeight,
    handleAdjustQty,
    handleDuplicate,
    handleEdit,
    handleDelete,
  }
}
