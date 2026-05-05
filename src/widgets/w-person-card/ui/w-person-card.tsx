import { memo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import type { TPerson } from '@/entities/check'

import { IconButton, EIconButtonVariant, ItemCard, MarqueeTitle } from '@/shared/ui'

import './w-person-card.scss'

type TWPersonCardProps = {
  person: TPerson
  onEdit: () => void
  onDelete: () => void
}

const WPersonCardComponent = ({ person, onEdit, onDelete }: TWPersonCardProps) => {
  return (
    <ItemCard>
      <div className="w-person-card__header">
        <MarqueeTitle as="h3">{person.name}</MarqueeTitle>
        <div className="w-person-card__actions">
          <IconButton icon={<Pencil />} onClick={onEdit} title="Редактировать" aria-label="Редактировать" />
          <IconButton
            icon={<Trash2 />}
            variant={EIconButtonVariant.Danger}
            onClick={onDelete}
            title="Удалить"
            aria-label="Удалить"
          />
        </div>
      </div>
    </ItemCard>
  )
}

export const WPersonCard = memo(WPersonCardComponent)
