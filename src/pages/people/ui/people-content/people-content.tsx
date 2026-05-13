import { memo } from 'react'
import { Trash2, Users } from 'lucide-react'

import type { TPerson } from '@entities/check'
import { WPersonCard } from '@widgets/w-person-card'
import { PageHeader, Button, EButtonVariant, AnimatedList } from '@shared/ui'
import { pluralize } from '@shared/lib'

type TPeopleContentProps = {
  people: TPerson[]
  onEdit: (person: TPerson) => void
  onDeletePerson: (person: TPerson) => void
  onOpenClearAll: () => void
}

export const PeopleContent = memo(({ people, onEdit, onDeletePerson, onOpenClearAll }: TPeopleContentProps) => {
  return (
    <>
      <PageHeader
        icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />}
        title="Участники"
        subtitle={`${people.length} ${pluralize(people.length, ['человек', 'человека', 'человек'])}`}
        action={
          <Button
            variant={EButtonVariant.Danger}
            onClick={onOpenClearAll}
            title="Удалить всех участников"
            icon={<Trash2 size={'var(--button-icon-size)'} aria-hidden="true" />}
          />
        }
      />

      <AnimatedList
        as="ul"
        role="list"
        className="list-layout"
        staggerDelay={0.05}
        items={people}
        getKey={(person) => person.id}
        renderItem={(person) => (
          <WPersonCard person={person} onEdit={() => onEdit(person)} onDelete={() => onDeletePerson(person)} />
        )}
      />
    </>
  )
})
PeopleContent.displayName = 'PeopleContent'
