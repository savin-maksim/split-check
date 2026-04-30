import { useCallback, memo } from 'react'
import { Trash2, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useCheckStore } from '@/entities/check'
import type { TPerson } from '@/entities/check'
import { WPersonCard } from '@/widgets/w-person-card'
import { PageHeader, Button, EButtonVariant, AnimatedListLayout } from '@/shared/ui'
import { pluralize } from '@/shared/lib'

type TPeopleContentProps = {
  checkId: string
  people: TPerson[]
  onEdit: (person: TPerson) => void
  onOpenClearAll: () => void
}

export const PeopleContent = memo(({ checkId, people, onEdit, onOpenClearAll }: TPeopleContentProps) => {
  const removePerson = useCheckStore((s) => s.removePerson)

  const handleDeletePerson = useCallback(
    (personId: number) => {
      removePerson(checkId, personId)
      toast.success('Участник удалён')
    },
    [removePerson, checkId],
  )

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

      <AnimatedListLayout
        as="ul"
        role="list"
        className="list-layout"
        items={people}
        getKey={(person) => person.id}
        renderItem={(person) => (
          <WPersonCard
            person={person}
            onEdit={() => onEdit(person)}
            onDelete={() => handleDeletePerson(person.id)}
          />
        )}
      />
    </>
  )
})
PeopleContent.displayName = 'PeopleContent'
