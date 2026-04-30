import { memo, useCallback } from 'react'
import { ChartPie, ListChecks } from 'lucide-react'

import type { TPerson } from '@/entities/check'

import { cn } from '@/shared/lib'
import { PersonGrid, PersonBadge } from '@/shared/ui'

import './split-between-section.scss'

type TSplitBetweenSectionProps = {
  people: TPerson[]
  split: Record<number, number>
  onTogglePerson: (person: TPerson) => void
  onAdjustWeight: (personId: number, delta: number) => void
  isWeighted: boolean
  onToggleDistribution: () => void
  onSelectAll: () => void
}

type TSplitWeightRowProps = {
  personId: number
  name: string
  value: number
  onAdjustWeight: (personId: number, delta: number) => void
}

const SplitWeightRow = memo(function SplitWeightRow({ personId, name, value, onAdjustWeight }: TSplitWeightRowProps) {
  const onDecrease = useCallback(() => onAdjustWeight(personId, -1), [onAdjustWeight, personId])
  const onIncrease = useCallback(() => onAdjustWeight(personId, 1), [onAdjustWeight, personId])

  return <PersonBadge value={value} label={name} onDecrease={onDecrease} onIncrease={onIncrease} />
})
SplitWeightRow.displayName = 'SplitWeightRow'

const SplitBetweenSectionComponent = ({
  people,
  split,
  onTogglePerson,
  onAdjustWeight,
  isWeighted,
  onToggleDistribution,
  onSelectAll,
}: TSplitBetweenSectionProps) => {
  const selectedPeople = people.filter((p) => (split[p.id] ?? 0) > 0)

  return (
    <div className="split-between-section">
      <div className="split-between-section__header">
        <button
          type="button"
          className="split-between-section__select-all icon-button"
          onClick={onSelectAll}
          disabled={people.length === 0}
          title="Выделить всех"
          aria-label="Выделить всех"
        >
          <ListChecks size={'var(--bottom-nav-icon-size)'} />
        </button>
        <button
          type="button"
          className="split-between-section__label"
          onClick={onToggleDistribution}
          title={isWeighted ? 'Переключить на равные доли' : 'Переключить на доли по весам'}
        >
          <p>На кого разделить?</p>
          <span className={cn('icon-button', isWeighted && 'icon-button--active')} aria-hidden>
            <ChartPie size={'var(--bottom-nav-icon-size)'} />
          </span>
        </button>
      </div>

      {isWeighted ? (
        <PersonGrid variant="weights">
          {people.map((person) => (
            <SplitWeightRow
              key={person.id}
              personId={person.id}
              name={person.name}
              value={split[person.id] ?? 0}
              onAdjustWeight={onAdjustWeight}
            />
          ))}
        </PersonGrid>
      ) : (
        <PersonGrid people={people} selected={selectedPeople} onToggle={onTogglePerson} />
      )}
    </div>
  )
}

export const SplitBetweenSection = memo(SplitBetweenSectionComponent)
SplitBetweenSection.displayName = 'SplitBetweenSection'
