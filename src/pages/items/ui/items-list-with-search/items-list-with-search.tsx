import { useState, useMemo, memo } from 'react'
import { Search } from 'lucide-react'

import { EPaymentMode } from '@/entities/check'
import type { TItem, TPerson } from '@/entities/check'
import { WCostCard } from '@/widgets/w-cost-card'
import { Input } from '@/shared/ui'

type TItemsListWithSearchProps = {
  checkId: string
  people: TPerson[]
  items: TItem[]
  paymentMode: EPaymentMode
  onEdit: (item: TItem) => void
  onRequestDelete: (item: TItem) => void
}

export const ItemsListWithSearch = memo(function ItemsListWithSearch({
  checkId,
  people,
  items,
  paymentMode,
  onEdit,
  onRequestDelete,
}: TItemsListWithSearchProps) {
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

  return (
    <>
      <div className="p-items__search">
        <Input
          name="search"
          icon={<Search size={'var(--button-icon-size)'} aria-hidden="true" />}
          clearable
          label="Поиск по названию/имени"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          enterKeyHint="search"
        />
      </div>
      <div className="list-layout">
        {filteredItems.map((item) => (
          <WCostCard
            key={item.id}
            checkId={checkId}
            item={item}
            people={people}
            paymentMode={paymentMode}
            onEdit={onEdit}
            onDelete={onRequestDelete}
          />
        ))}
      </div>
    </>
  )
})
ItemsListWithSearch.displayName = 'ItemsListWithSearch'
