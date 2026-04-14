import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'

import type { TPerson } from '@/entities/check'

import { cn } from '@/shared/lib'
import { IconButton, PersonGrid } from '@/shared/ui'

import './who-paid-section.scss'

type TWhoPaidSectionProps = {
  people: TPerson[]
  paidByIds: number[]
  expanded: boolean
  onToggle: () => void
  onPersonToggle: (person: TPerson) => void
}

export const WhoPaidSection = ({ people, paidByIds, expanded, onToggle, onPersonToggle }: TWhoPaidSectionProps) => {
  const selectedPeople = people.filter((p) => paidByIds.includes(p.id))

  return (
    <div className="who-paid-section">
      <div className={cn('who-paid-section__label', !expanded && 'who-paid-section__label--collapsed')}>
        <span>Кто платил?</span>
        {!expanded && selectedPeople.length > 0 && (
          <span className="who-paid-section__label-picked">{selectedPeople.map((p) => p.name).join(', ')}</span>
        )}
        <IconButton
          icon={expanded ? <ChevronsDownUp /> : <ChevronsUpDown />}
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? 'Скрыть список' : 'Показать список'}
          title={expanded ? 'Скрыть список' : 'Показать список'}
        />
      </div>
      <div className={cn('who-paid-section__collapse', expanded && 'who-paid-section__collapse--open')}>
        <div className="who-paid-section__collapse-inner">
          <PersonGrid people={people} selected={selectedPeople} onToggle={onPersonToggle} />
        </div>
      </div>
    </div>
  )
}
