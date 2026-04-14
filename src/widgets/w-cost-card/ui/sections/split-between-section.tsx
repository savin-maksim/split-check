import { ChartPie } from 'lucide-react'

import type { TPerson } from '@/entities/check'

import { IconButton, EIconButtonVariant, PersonGrid, PersonBadge } from '@/shared/ui'

import './split-between-section.scss'

type TSplitBetweenSectionProps = {
  people: TPerson[]
  split: Record<number, number>
  onTogglePerson: (person: TPerson) => void
  onAdjustWeight: (personId: number, delta: number) => void
  isWeighted: boolean
  onToggleDistribution: () => void
}

export const SplitBetweenSection = ({
  people,
  split,
  onTogglePerson,
  onAdjustWeight,
  isWeighted,
  onToggleDistribution,
}: TSplitBetweenSectionProps) => {
  const selectedPeople = people.filter((p) => (split[p.id] ?? 0) > 0)

  return (
    <div className="split-between-section">
      <div className="split-between-section__label">
        <p>На кого разделить?</p>
        <IconButton
          icon={<ChartPie />}
          variant={isWeighted ? EIconButtonVariant.Active : undefined}
          onClick={onToggleDistribution}
          aria-label={isWeighted ? 'Переключить на равные доли' : 'Переключить на доли по весам'}
        />
      </div>

      {isWeighted ? (
        <PersonGrid variant="weights">
          {people.map((person) => (
            <PersonBadge
              key={person.id}
              value={split[person.id] ?? 0}
              label={person.name}
              onDecrease={() => onAdjustWeight(person.id, -1)}
              onIncrease={() => onAdjustWeight(person.id, 1)}
            />
          ))}
        </PersonGrid>
      ) : (
        <PersonGrid people={people} selected={selectedPeople} onToggle={onTogglePerson} />
      )}
    </div>
  )
}
