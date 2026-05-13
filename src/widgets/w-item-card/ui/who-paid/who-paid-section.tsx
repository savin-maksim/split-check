import { memo } from 'react'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'

import type { TPerson } from '@entities/check'

import { cn } from '@shared/lib'
import { PersonGrid } from '@shared/ui'

import './who-paid-section.scss'

type TWhoPaidSectionProps = {
  people: TPerson[]
  paidById: number
  expanded: boolean
  onToggle: () => void
  onPersonToggle: (person: TPerson) => void
}

const WhoPaidSectionComponent = ({ people, paidById, expanded, onToggle, onPersonToggle }: TWhoPaidSectionProps) => {
  const selectedPeople = people.filter((p) => p.id === paidById)

  const titleHint = expanded ? 'Скрыть список' : 'Показать список'

  return (
    <div className="who-paid-section">
      <button
        type="button"
        className={cn('who-paid-section__label', !expanded && 'who-paid-section__label--collapsed')}
        onClick={onToggle}
        title={titleHint}
      >
        <span>Кто платил?</span>
        {!expanded && selectedPeople.length > 0 && (
          <span className="who-paid-section__label-picked">{selectedPeople.map((p) => p.name).join(', ')}</span>
        )}
        <span aria-hidden="true" className="icon-button who-paid-section__icon">
          {expanded ? (
            <ChevronsDownUp size={'var(--bottom-nav-icon-size)'} />
          ) : (
            <ChevronsUpDown size={'var(--bottom-nav-icon-size)'} />
          )}
        </span>
      </button>
      <div className={cn('who-paid-section__collapse', expanded && 'who-paid-section__collapse--open')}>
        <div className="who-paid-section__collapse-inner">
          <PersonGrid people={people} selected={selectedPeople} onToggle={onPersonToggle} />
        </div>
      </div>
    </div>
  )
}

export const WhoPaidSection = memo(WhoPaidSectionComponent)
WhoPaidSection.displayName = 'WhoPaidSection'
