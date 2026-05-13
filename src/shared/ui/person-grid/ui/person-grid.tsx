import { memo } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@shared/lib'
import { Button, EButtonVariant } from '@shared/ui/button'

import './person-grid.scss'

type TPerson = {
  id: number
  name: string
}

type TPersonGridProps = {
  people?: TPerson[]
  selected?: TPerson[]
  onToggle?: (person: TPerson) => void
  children?: ReactNode
  variant?: 'weights'
  className?: string
}

export const PersonGrid = memo(
  ({ people, selected = [], onToggle, children, variant, className, ...rest }: TPersonGridProps) => {
    if (children) {
      return (
        <div className={cn('person-grid', variant === 'weights' && 'person-grid--weights', className)} {...rest}>
          {children}
        </div>
      )
    }

    return (
      <div className={cn('person-grid', variant === 'weights' && 'person-grid--weights', className)} {...rest}>
        {people?.map((person) => (
          <Button
            key={person.id}
            variant={selected.some((p) => p.id === person.id) ? EButtonVariant.Active : undefined}
            onClick={() => onToggle?.(person)}
          >
            {person.name}
          </Button>
        ))}
      </div>
    )
  },
)
PersonGrid.displayName = 'PersonGrid'
