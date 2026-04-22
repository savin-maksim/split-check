import { useState, useCallback, useMemo, useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, Users, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useCurrentCheck, useCheckStore, EPaymentMode, isSplitDistributionWeightedView } from '@/entities/check'
import type { TItem, TPerson } from '@/entities/check'
import { WCostCard } from '@/widgets/w-cost-card'
import { FManageItem } from '@/features/f-manage-item'
import { FPaymentMode } from '@/features/f-payment-mode'
import { FConfirmDelete } from '@/features/f-confirm-delete'
import { FReceiptScan } from '@/features/f-receipt-scan'
import { PageHeader, EmptyState, Input, PersonGrid, Button, EButtonVariant } from '@/shared/ui'
import { useNavActionStore } from '@/shared/lib'
import { buildRoute } from '@/shared/constants'

import './p-items.scss'

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

const ItemsContent = memo(
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
    const updateItem = useCheckStore((s) => s.updateItem)
    const duplicateItem = useCheckStore((s) => s.duplicateItem)
    const setPaymentMode = useCheckStore((s) => s.setPaymentMode)
    const setSinglePayer = useCheckStore((s) => s.setSinglePayer)

    const [searchQuery, setSearchQuery] = useState('')

    const filteredItems = useMemo(() => {
      if (!searchQuery.trim()) return items
      const query = searchQuery.toLowerCase()
      return items.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query)
        const payerMatch = item.paidBy.some((payerId) =>
          people
            .find((p) => p.id === payerId)
            ?.name.toLowerCase()
            .includes(query),
        )
        return titleMatch || payerMatch
      })
    }, [items, searchQuery, people])

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
          <h2 className="p-items__toolbar-title grid--span-4">Режим оплаты</h2>
          <FPaymentMode className="grid--span-4" value={paymentMode} onChange={handlePaymentModeChange} />
          <Input
            className="grid--span-3"
            name="search"
            icon={<Search size={'var(--button-icon-size)'} aria-hidden="true" />}
            clearable
            label="Поиск по названию/имени"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            enterKeyHint="search"
          />
          <FReceiptScan
            people={people}
            paymentMode={paymentMode}
            singlePayerId={singlePayer}
            onAddItems={onAddBulkItems}
          />
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

        <div className="list-layout">
          {filteredItems.map((item) => (
            <WCostCard
              key={item.id}
              item={item}
              people={people}
              paymentMode={paymentMode}
              paidByExpanded={item.paidBySectionExpanded ?? false}
              isWeighted={isSplitDistributionWeightedView(item)}
              onTogglePaidByExpanded={() => {
                if (paymentMode === EPaymentMode.Single) return
                updateItem(checkId, item.id, {
                  paidBySectionExpanded: !(item.paidBySectionExpanded ?? false),
                })
              }}
              onPersonPaidToggle={(person) => {
                if (paymentMode === EPaymentMode.Single) return
                updateItem(checkId, item.id, { paidBy: [person.id], paidBySectionExpanded: false })
              }}
              onSplitPersonToggle={(person) => {
                const current = item.split[person.id] ?? 0
                updateItem(checkId, item.id, {
                  split: { ...item.split, [person.id]: current > 0 ? 0 : 1 },
                })
              }}
              onToggleDistribution={() => {
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
              }}
              onAdjustWeight={(personId, delta) => {
                const current = item.split[personId] ?? 0
                updateItem(checkId, item.id, {
                  split: { ...item.split, [personId]: Math.max(0, current + delta) },
                })
              }}
              onAdjustQty={(delta) => {
                const newQty = Math.max(1, item.qty + delta)
                updateItem(checkId, item.id, { qty: newQty })
              }}
              onDuplicate={() => duplicateItem(checkId, item.id)}
              onEdit={() => onEdit(item)}
              onDelete={() => onRequestDelete(item)}
            />
          ))}
        </div>
      </>
    )
  },
)
ItemsContent.displayName = 'ItemsContent'

export const PItems = () => {
  const { check, checkId } = useCurrentCheck()
  const addItem = useCheckStore((s) => s.addItem)
  const removeItem = useCheckStore((s) => s.removeItem)
  const removeAllItems = useCheckStore((s) => s.removeAllItems)
  const setNavAction = useNavActionStore((s) => s.setOnAction)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<TItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<TItem | null>(null)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)

  useEffect(() => {
    setNavAction(() => setIsAddOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])

  const people = check?.people ?? []
  const items = check?.items ?? []
  const paymentMode = check?.paymentMode ?? EPaymentMode.Manual
  const singlePayer = check?.singlePayer ?? null

  const handleAddItem = useCallback(
    (item: Omit<TItem, 'id'>) => {
      addItem(checkId, { ...item, paidBySectionExpanded: true })
      toast.success('Позиция добавлена')
      setIsAddOpen(false)
    },
    [addItem, checkId],
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
        addItem(checkId, { ...entry, paidBySectionExpanded: i === n - 1 })
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

  const handleOpenClearAll = useCallback(() => setIsClearAllOpen(true), [])

  if (!check) return null

  if (people.length === 0) {
    return (
      <>
        <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Расходы" />
        <EmptyState
          icon={<Users size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
          title="Добавьте участников"
        >
          <p>
            Перейдите на <Link to={buildRoute.people(checkId)}>страницу участников</Link> и добавьте людей
          </p>
        </EmptyState>
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader icon={<Calculator size={'var(--header-icon-size)'} aria-hidden="true" />} title="Расходы" />
        <EmptyState
          icon={<Calculator size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
          title="Добавьте расходы"
          actions={
            <FReceiptScan
              people={people}
              paymentMode={paymentMode}
              singlePayerId={singlePayer}
              onAddItems={handleAddBulkItems}
            />
          }
        >
          <p>Нажмите на кнопку в навигационной панели, чтобы добавить расходы</p>
        </EmptyState>

        <FManageItem
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          mode="add"
          people={people}
          paymentMode={paymentMode}
          singlePayerId={singlePayer}
          onSubmit={handleAddItem}
        />
      </>
    )
  }

  return (
    <>
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

      <FManageItem
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        mode="add"
        people={people}
        paymentMode={paymentMode}
        singlePayerId={singlePayer}
        onSubmit={handleAddItem}
      />

      <FManageItem
        isOpen={editItem != null}
        onClose={() => setEditItem(null)}
        mode="edit"
        initialData={editItem ?? undefined}
        people={people}
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
  )
}
