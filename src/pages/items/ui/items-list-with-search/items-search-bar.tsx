import { useCallback, useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'

import { Input, AnimatedBlock } from '@/shared/ui'
import { animatedBlockMotion, createEnterKeyDownHandler, useDebouncedValue } from '@/shared/lib'

import { ItemsSearchModeToggle } from './items-search-mode-toggle'
import type { TSearchMode } from './items-search-types'

const SEARCH_DEBOUNCE_MS = 500

const SEARCH_INPUT_LABEL_BY_MODE: Record<TSearchMode, string> = {
  all: 'Поиск по всем полям',
  title: 'Поиск по названию позиции',
  paidBy: 'Поиск по плательщику',
  split: 'Поиск по участнику в разделении',
}

export type { TSearchMode } from './items-search-types'

type TItemsSearchBarProps = {
  searchMode: TSearchMode
  onSearchModeChange: (mode: TSearchMode) => void
  onDebouncedQueryChange: (query: string) => void
}

export const ItemsSearchBar = ({ searchMode, onSearchModeChange, onDebouncedQueryChange }: TItemsSearchBarProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, flushDebouncedQuery] = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onDebouncedQueryChange(debouncedQuery)
  }, [debouncedQuery, onDebouncedQueryChange])

  const handleConfirmSearch = useCallback(() => {
    flushDebouncedQuery()
    inputRef.current?.blur()
  }, [flushDebouncedQuery])

  const handleSearchKeyDown = createEnterKeyDownHandler(handleConfirmSearch)

  return (
    <AnimatedBlock className="p-items__search" blockMotion={animatedBlockMotion}>
      <Input
        ref={inputRef}
        className="items-list-with-search__input"
        name="search"
        icon={<Search size={'var(--button-icon-size)'} aria-hidden="true" />}
        suffix={<ItemsSearchModeToggle searchMode={searchMode} onSearchModeChange={onSearchModeChange} />}
        clearable
        label={SEARCH_INPUT_LABEL_BY_MODE[searchMode]}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        enterKeyHint="done"
      />
    </AnimatedBlock>
  )
}
