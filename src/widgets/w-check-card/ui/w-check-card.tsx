import { memo } from 'react'
import type { MouseEvent } from 'react'
import { Pencil, Trash2, Users, Calculator, Receipt } from 'lucide-react'

import type { TCheck } from '@/entities/check'
import { getItemTotal } from '@/entities/check'

import { cn, formatSavedDate, formatMoney, pluralize, createKeyboardActivationHandler } from '@/shared/lib'
import { ItemCard, CardHeader, IconButton, EIconButtonVariant, CardStats } from '@/shared/ui'

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

  const handleOpenKeyDown = createKeyboardActivationHandler(onOpen)

  const stopAndCall = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation()
    fn()
  }

  return (
    <ItemCard
      className={cn(isActive && 'item-card--active')}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleOpenKeyDown}
    >
      <CardHeader
        title={check.title}
        actions={
          <>
            <IconButton icon={<Pencil />} onClick={stopAndCall(onEdit)} title="Редактировать" aria-label="Редактировать" />
            <IconButton
              icon={<Trash2 />}
              variant={EIconButtonVariant.Danger}
              onClick={stopAndCall(onDelete)}
              title="Удалить"
              aria-label="Удалить"
            />
          </>
        }
      />

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
