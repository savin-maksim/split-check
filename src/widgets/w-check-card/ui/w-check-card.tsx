import { memo, useCallback } from 'react'
import { Pencil, Trash2, Users, Calculator, Receipt } from 'lucide-react'

import type { TCheck } from '@/entities/check'
import { getItemTotal } from '@/entities/check'

import { cn, formatSavedDate, formatMoney, pluralize, createKeyboardActivationHandler } from '@/shared/lib'
import { ItemCard, MarqueeTitle, IconButton, EIconButtonVariant, CardStats } from '@/shared/ui'

import './w-check-card.scss'

type TWCheckCardProps = {
  check: TCheck
  isActive?: boolean
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

const WCheckCardComponent = ({ check, isActive, onOpen, onEdit, onDelete }: TWCheckCardProps) => {
  const peopleCount = check.people.length
  const itemsCount = check.items.length
  const totalKopecks = check.items.reduce((sum, item) => sum + getItemTotal(item), 0)

  const handleOpenKeyDown = useCallback(createKeyboardActivationHandler(onOpen), [onOpen])

  return (
    <ItemCard
      className={cn(isActive && 'item-card--active')}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleOpenKeyDown}
    >
      <div className="w-check-card__header">
        <MarqueeTitle as="h3">{check.title}</MarqueeTitle>
        <div className="w-check-card__actions">
          <IconButton
            icon={<Pencil />}
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            title="Редактировать"
            aria-label="Редактировать"
          />
          <IconButton
            icon={<Trash2 />}
            variant={EIconButtonVariant.Danger}
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            title="Удалить"
            aria-label="Удалить"
          />
        </div>
      </div>

      <time className="w-check-card__date" dateTime={new Date(check.createdAt).toISOString()}>
        {formatSavedDate(check.createdAt)}
      </time>

      <div className="w-check-card__footer">
        <div className="w-check-card__footer-inner">
          <CardStats
            icon={<Users size={'var(--button-icon-size)'} aria-hidden="true" />}
            value={peopleCount}
            label={pluralize(peopleCount, ['человек', 'человека', 'человек'])}
          />
          <CardStats
            icon={<Calculator size={'var(--button-icon-size)'} aria-hidden="true" />}
            value={itemsCount}
            label={pluralize(itemsCount, ['позиция', 'позиции', 'позиций'])}
          />
          <CardStats
            className="card-stats--sum"
            icon={<Receipt size={'var(--button-icon-size)'} aria-hidden="true" />}
            value={formatMoney(totalKopecks)}
          />
        </div>
      </div>
    </ItemCard>
  )
}

export const WCheckCard = memo(WCheckCardComponent)
