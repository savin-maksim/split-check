import { useState, useMemo, memo } from 'react'
import { Search } from 'lucide-react'

import type { EPaymentMode, TItem, TPerson } from '@/entities/check'
import { WCostCard } from '@/widgets/w-cost-card'
import { Input, AnimatedList, AnimatedBlock } from '@/shared/ui'
import { animatedBlockMotion } from '@/shared/lib'

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
      <AnimatedBlock className="p-items__search" blockMotion={animatedBlockMotion}>
        <Input
          name="search"
          icon={<Search size={'var(--button-icon-size)'} aria-hidden="true" />}
          clearable
          label="Поиск по названию/имени"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          enterKeyHint="search"
        />
      </AnimatedBlock>

      <AnimatedList
        initialDelay={0.05}
        staggerDelay={0.05}
        className="list-layout"
        items={filteredItems}
        getKey={(item) => item.id}
        renderItem={(item) => (
          <WCostCard
            checkId={checkId}
            item={item}
            people={people}
            paymentMode={paymentMode}
            onEdit={onEdit}
            onDelete={onRequestDelete}
          />
        )}
      />
    </>
  )
})
ItemsListWithSearch.displayName = 'ItemsListWithSearch'
