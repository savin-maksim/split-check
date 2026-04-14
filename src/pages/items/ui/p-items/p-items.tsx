import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, Users, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useCurrentCheck, useCheckStore, EPaymentMode } from '@/entities/check'
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
    onOpenClearAll,
    onAddBulkItems,
  }: TItemsContentProps) => {
    const updateItem = useCheckStore((s) => s.updateItem)
    const removeItem = useCheckStore((s) => s.removeItem)
    const duplicateItem = useCheckStore((s) => s.duplicateItem)
    const setPaymentMode = useCheckStore((s) => s.setPaymentMode)
    const setSinglePayer = useCheckStore((s) => s.setSinglePayer)

    const [searchQuery, setSearchQuery] = useState('')
    const [expandedPaidBy, setExpandedPaidBy] = useState<Set<number>>(() => new Set())
    const [weightedView, setWeightedView] = useState<Set<number>>(() => new Set())

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

    const togglePaidByExpanded = useCallback((itemId: number) => {
      setExpandedPaidBy((prev) => {
        const next = new Set(prev)
        if (next.has(itemId)) next.delete(itemId)
        else next.add(itemId)
        return next
      })
    }, [])

    return (
      <>
        <PageHeader
          icon={<Calculator size={40} aria-hidden="true" />}
          title="Расходы"
          action={
            <Button variant={EButtonVariant.Danger} onClick={onOpenClearAll}>
              Удалить позиции
            </Button>
          }
        />

        <FPaymentMode value={paymentMode} onChange={handlePaymentModeChange} />

        <div className="p-items__toolbar">
          <Input
            icon={<Search size={20} aria-hidden="true" />}
            clearable
            label="Поиск наименование/имя"
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              paidByExpanded={expandedPaidBy.has(item.id)}
              isWeighted={weightedView.has(item.id)}
              onTogglePaidByExpanded={() => togglePaidByExpanded(item.id)}
              onPersonPaidToggle={(person) => updateItem(checkId, item.id, { paidBy: [person.id] })}
              onSplitPersonToggle={(person) => {
                const current = item.split[person.id] ?? 0
                updateItem(checkId, item.id, {
                  split: { ...item.split, [person.id]: current > 0 ? 0 : 1 },
                })
              }}
              onToggleDistribution={() => {
                setWeightedView((prev) => {
                  const next = new Set(prev)
                  if (next.has(item.id)) next.delete(item.id)
                  else next.add(item.id)
                  return next
                })
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
              onDelete={() => {
                removeItem(checkId, item.id)
                toast.success('Позиция удалена')
              }}
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
  const removeAllItems = useCheckStore((s) => s.removeAllItems)
  const setNavAction = useNavActionStore((s) => s.setOnAction)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<TItem | null>(null)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)
  const reopenTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setNavAction(() => setIsAddOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])

  useEffect(() => () => clearTimeout(reopenTimerRef.current), [])

  const people = check?.people ?? []
  const items = check?.items ?? []
  const paymentMode = check?.paymentMode ?? EPaymentMode.Manual
  const singlePayer = check?.singlePayer ?? null

  const handleAddItem = useCallback(
    (item: Omit<TItem, 'id'>) => {
      const finalItem =
        paymentMode === EPaymentMode.Single && singlePayer != null ? { ...item, paidBy: [singlePayer] } : item
      addItem(checkId, finalItem)
      toast.success('Позиция добавлена')

      clearTimeout(reopenTimerRef.current)
      setIsAddOpen(false)
      reopenTimerRef.current = setTimeout(() => setIsAddOpen(true), 800)
    },
    [addItem, checkId, paymentMode, singlePayer],
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
      newItems.forEach((item) => addItem(checkId, item))
    },
    [addItem, checkId],
  )

  const handleClearAll = useCallback(() => {
    removeAllItems(checkId)
    toast.success('Все позиции удалены')
  }, [removeAllItems, checkId])

  const handleOpenClearAll = useCallback(() => setIsClearAllOpen(true), [])

  if (!check) return null

  if (people.length === 0) {
    return (
      <div className="p-items">
        <EmptyState icon={<Users size={48} aria-hidden="true" />} title="Добавьте участников">
          <p>
            Перейдите на <Link to={buildRoute.people(checkId)}>страницу участников</Link> и добавьте людей
          </p>
        </EmptyState>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-items">
        <EmptyState
          icon={<Calculator size={48} aria-hidden="true" />}
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
          onSubmit={handleAddItem}
        />
      </div>
    )
  }

  return (
    <div className="p-items">
      <ItemsContent
        checkId={checkId}
        people={people}
        items={items}
        paymentMode={paymentMode}
        singlePayer={singlePayer}
        onEdit={setEditItem}
        onOpenClearAll={handleOpenClearAll}
        onAddBulkItems={handleAddBulkItems}
      />

      <FManageItem
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        mode="add"
        people={people}
        paymentMode={paymentMode}
        onSubmit={handleAddItem}
      />

      <FManageItem
        isOpen={editItem != null}
        onClose={() => setEditItem(null)}
        mode="edit"
        initialData={editItem ?? undefined}
        people={people}
        paymentMode={paymentMode}
        onSubmit={handleEditItem}
      />

      <FConfirmDelete
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        title="Удалить все позиции?"
        message="Все расходы в текущем чеке будут удалены. Участники останутся. Действие нельзя отменить."
      />
    </div>
  )
}
