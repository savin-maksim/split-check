import { memo, useCallback, useMemo } from 'react'

import type { EPaymentMode, TItem, TPerson } from '@/entities/check'
import { WItemCard } from '@/widgets/w-item-card'
import { AnimatedList } from '@/shared/ui'
import { getItemAnchorId } from '@/shared/lib'

import type { TSearchMode } from './items-search-types'

type TItemsFilteredListProps = {
  checkId: string
  people: TPerson[]
  items: TItem[]
  paymentMode: EPaymentMode
  debouncedQuery: string
  searchMode: TSearchMode
  onEdit: (item: TItem) => void
  onRequestDelete: (item: TItem) => void
}

export const ItemsFilteredList = memo(function ItemsFilteredList({
  checkId,
  people,
  items,
  paymentMode,
  debouncedQuery,
  searchMode,
  onEdit,
  onRequestDelete,
}: TItemsFilteredListProps) {
  const filteredItems = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase()
    if (!query) return items

    const namesMap: Record<number, string> = {}
    people.forEach((p) => {
      namesMap[p.id] = p.name.toLowerCase()
    })

    return items.filter((item) => {
      const titleMatch = () => item.title.toLowerCase().includes(query)
      const payerMatch = () => namesMap[item.paidBy]?.includes(query) ?? false
      const splitMatch = () => Object.keys(item.split).some((personId) => namesMap[Number(personId)]?.includes(query))

      if (searchMode === 'title') return titleMatch()
      if (searchMode === 'paidBy') return payerMatch()
      if (searchMode === 'split') return splitMatch()

      return titleMatch() || payerMatch() || splitMatch()
    })
  }, [items, debouncedQuery, people, searchMode])

  const renderItem = useCallback(
    (item: TItem) => (
      <WItemCard
        checkId={checkId}
        item={item}
        people={people}
        paymentMode={paymentMode}
        onEdit={onEdit}
        onDelete={onRequestDelete}
      />
    ),
    [checkId, people, paymentMode, onEdit, onRequestDelete],
  )

  const getKey = useCallback((item: TItem) => item.id, [])
  const getItemDomId = useCallback((item: TItem) => getItemAnchorId(checkId, item.id), [checkId])

  return (
    <AnimatedList
      initialDelay={0.05}
      staggerDelay={0.05}
      className="list-layout"
      items={filteredItems}
      getKey={getKey}
      getItemDomId={getItemDomId}
      renderItem={renderItem}
    />
  )
})

ItemsFilteredList.displayName = 'ItemsFilteredList'
