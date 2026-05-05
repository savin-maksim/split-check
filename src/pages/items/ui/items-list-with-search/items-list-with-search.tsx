import { useState, useMemo, memo, useRef, useCallback } from 'react'
import { Search } from 'lucide-react'

import type { EPaymentMode, TItem, TPerson } from '@/entities/check'
import { WCostCard } from '@/widgets/w-cost-card'
import { Input, AnimatedList, AnimatedBlock } from '@/shared/ui'
import { animatedBlockMotion, createEnterKeyDownHandler, getItemAnchorId, useDebouncedValue } from '@/shared/lib'

const SEARCH_DEBOUNCE_MS = 300

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
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, flushDebouncedQuery] = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleConfirmSearch = useCallback(() => {
    flushDebouncedQuery()
    inputRef.current?.blur()
  }, [flushDebouncedQuery])

  const handleSearchKeyDown = createEnterKeyDownHandler(handleConfirmSearch)

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items
    const query = debouncedQuery.toLowerCase()
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
  }, [items, debouncedQuery, people])

  return (
    <>
      <AnimatedBlock className="p-items__search" blockMotion={animatedBlockMotion}>
        <Input
          ref={inputRef}
          className="items-list-with-search__input"
          name="search"
          icon={<Search size={'var(--button-icon-size)'} aria-hidden="true" />}
          clearable
          label="Поиск по названию/имени"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          enterKeyHint="done"
        />
      </AnimatedBlock>

      <AnimatedList
        initialDelay={0.05}
        staggerDelay={0.05}
        className="list-layout"
        items={filteredItems}
        getKey={(item) => item.id}
        getItemDomId={(item) => getItemAnchorId(checkId, item.id)}
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
