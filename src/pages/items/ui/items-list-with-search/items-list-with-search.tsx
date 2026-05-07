import { useState, memo } from 'react'

import type { EPaymentMode, TItem, TPerson } from '@/entities/check'

import { ItemsFilteredList } from './items-filtered-list'
import { ItemsSearchBar } from './items-search-bar'
import type { TSearchMode } from './items-search-types'

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
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchMode, setSearchMode] = useState<TSearchMode>('all')

  return (
    <>
      <ItemsSearchBar
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        onDebouncedQueryChange={setDebouncedQuery}
      />
      <ItemsFilteredList
        checkId={checkId}
        people={people}
        items={items}
        paymentMode={paymentMode}
        debouncedQuery={debouncedQuery}
        searchMode={searchMode}
        onEdit={onEdit}
        onRequestDelete={onRequestDelete}
      />
    </>
  )
})

ItemsListWithSearch.displayName = 'ItemsListWithSearch'
