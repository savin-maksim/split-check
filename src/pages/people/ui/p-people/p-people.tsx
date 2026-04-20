import { useState, useCallback, useEffect, memo } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useCurrentCheck, useCheckStore } from '@/entities/check'
import type { TPerson } from '@/entities/check'
import { WPersonCard } from '@/widgets/w-person-card'
import { FManagePerson } from '@/features/f-manage-person'
import { FConfirmDelete } from '@/features/f-confirm-delete'
import { PageHeader, EmptyState, Button, EButtonVariant } from '@/shared/ui'
import { pluralize, useNavActionStore } from '@/shared/lib'

import './p-people.scss'

type TPeopleContentProps = {
  checkId: string
  people: TPerson[]
  onEdit: (person: TPerson) => void
  onOpenClearAll: () => void
}

const PeopleContent = memo(({ checkId, people, onEdit, onOpenClearAll }: TPeopleContentProps) => {
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
        icon={<Users size={40} aria-hidden="true" />}
        title="Участники"
        subtitle={`${people.length} ${pluralize(people.length, ['человек', 'человека', 'человек'])}`}
        action={
          <Button variant={EButtonVariant.Danger} onClick={onOpenClearAll}>
            Удалить всех
          </Button>
        }
      />

      <ul className="list-layout" role="list">
        {people.map((person) => (
          <WPersonCard
            key={person.id}
            person={person}
            onEdit={() => onEdit(person)}
            onDelete={() => handleDeletePerson(person.id)}
          />
        ))}
      </ul>
    </>
  )
})
PeopleContent.displayName = 'PeopleContent'

export const PPeople = () => {
  const { check, checkId } = useCurrentCheck()
  const addPeople = useCheckStore((s) => s.addPeople)
  const removeAllPeople = useCheckStore((s) => s.removeAllPeople)
  const updatePerson = useCheckStore((s) => s.updatePerson)
  const setNavAction = useNavActionStore((s) => s.setOnAction)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<TPerson | null>(null)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)

  useEffect(() => {
    setNavAction(() => setIsAddOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])

  const people = check?.people ?? []

  const handleAddPerson = useCallback(
    (name: string) => {
      const names = name
        .split(',')
        .map((n) => n.trim())
        .filter((n) => n.length > 0)
      if (names.length === 0) return
      addPeople(checkId, names)
      toast.success(`Добавлено: ${names.length} ${pluralize(names.length, ['человек', 'человека', 'человек'])}`)
    },
    [addPeople, checkId],
  )

  const handleEditPerson = useCallback(
    (name: string) => {
      if (!editingPerson) return
      const ok = updatePerson(checkId, editingPerson.id, name)
      if (ok) {
        toast.success('Имя обновлено')
      } else {
        toast.error('Такое имя уже есть')
      }
    },
    [editingPerson, updatePerson, checkId],
  )

  const handleClearAll = useCallback(() => {
    removeAllPeople(checkId)
    toast.success('Все участники удалены')
  }, [removeAllPeople, checkId])

  const handleOpenClearAll = useCallback(() => setIsClearAllOpen(true), [])

  if (!check) return null

  return (
    <section className="p-people">
      {people.length === 0 ? (
        <>
          <PageHeader icon={<Users size={40} aria-hidden="true" />} title="Участники" />
          <EmptyState icon={<UserPlus size={48} aria-hidden="true" />} title="Добавьте участников">
            <p>
              Нажмите на кнопку в навигационной панели, чтобы добавить людей, между которыми нужно разделить расходы
            </p>
          </EmptyState>
        </>
      ) : (
        <PeopleContent
          checkId={checkId}
          people={people}
          onEdit={setEditingPerson}
          onOpenClearAll={handleOpenClearAll}
        />
      )}

      <FManagePerson
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        mode="add"
        onSubmit={handleAddPerson}
        title="Добавить участников"
      />

      <FManagePerson
        isOpen={editingPerson != null}
        onClose={() => setEditingPerson(null)}
        mode="edit"
        initialName={editingPerson?.name ?? ''}
        onSubmit={handleEditPerson}
        title="Редактировать имя"
      />

      <FConfirmDelete
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        title="Удалить всех участников?"
        message="Будут удалены все участники и все расходы. Это действие нельзя отменить."
      />
    </section>
  )
}
