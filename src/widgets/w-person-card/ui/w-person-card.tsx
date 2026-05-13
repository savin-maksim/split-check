import { memo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import type { TPerson } from '@entities/check'

import { IconButton, EIconButtonVariant, ItemCard, CardHeader } from '@shared/ui'

type TWPersonCardProps = {
  person: TPerson
  onEdit: () => void
  onDelete: () => void
}

const WPersonCardComponent = ({ person, onEdit, onDelete }: TWPersonCardProps) => {
  return (
    <ItemCard>
      <CardHeader
        title={person.name}
        actions={
          <>
            <IconButton icon={<Pencil />} onClick={onEdit} title="Редактировать" aria-label="Редактировать" />
            <IconButton
              icon={<Trash2 />}
              variant={EIconButtonVariant.Danger}
              onClick={onDelete}
              title="Удалить"
              aria-label="Удалить"
            />
          </>
        }
      />
    </ItemCard>
  )
}

export const WPersonCard = memo(WPersonCardComponent)
