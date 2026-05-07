import { memo } from 'react'
import { ListChecks, Type, Users, Wallet } from 'lucide-react'

import { EIconButtonVariant, IconButton } from '@/shared/ui'

import type { TSearchMode } from './items-search-types'

import './items-search-mode-toggle.scss'

type TItemsSearchModeToggleProps = {
  searchMode: TSearchMode
  onSearchModeChange: (mode: TSearchMode) => void
}

export const ItemsSearchModeToggle = memo(function ItemsSearchModeToggle({
  searchMode,
  onSearchModeChange,
}: TItemsSearchModeToggleProps) {
  return (
    <div className="items-search-mode-toggle" role="toolbar" aria-label="Режим поиска">
      <IconButton
        type="button"
        variant={searchMode === 'title' ? EIconButtonVariant.Active : undefined}
        aria-label="Искать по названию позиции"
        title="Название позиции"
        icon={<Type size={'var(--button-icon-size)'} aria-hidden="true" />}
        aria-pressed={searchMode === 'title'}
        onClick={() => onSearchModeChange('title')}
      />
      <IconButton
        type="button"
        variant={searchMode === 'paidBy' ? EIconButtonVariant.Active : undefined}
        aria-label="Искать по имени плательщика"
        title="Плательщик"
        icon={<Wallet size={'var(--button-icon-size)'} aria-hidden="true" />}
        aria-pressed={searchMode === 'paidBy'}
        onClick={() => onSearchModeChange('paidBy')}
      />
      <IconButton
        type="button"
        variant={searchMode === 'split' ? EIconButtonVariant.Active : undefined}
        aria-label="Искать по участнику в разделении"
        title="Участник"
        icon={<Users size={'var(--button-icon-size)'} aria-hidden="true" />}
        aria-pressed={searchMode === 'split'}
        onClick={() => onSearchModeChange('split')}
      />
      <IconButton
        type="button"
        variant={searchMode === 'all' ? EIconButtonVariant.Active : undefined}
        aria-label="Искать по всем полям"
        title="Все поля"
        icon={<ListChecks size={'var(--button-icon-size)'} aria-hidden="true" />}
        aria-pressed={searchMode === 'all'}
        onClick={() => onSearchModeChange('all')}
      />
    </div>
  )
})

ItemsSearchModeToggle.displayName = 'ItemsSearchModeToggle'
