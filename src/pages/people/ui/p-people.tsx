import { useState, useCallback } from 'react'

import type { TPerson } from '@/entities/check'
import { FManagePerson } from '@/features/f-manage-person'
import { FConfirmDelete } from '@/features/f-confirm-delete'
import { useRegisterNavAction } from '@/widgets/w-bottom-nav'
import { useCurrentCheckFromRoute } from '@/shared/lib'

import { usePeoplePageHandlers } from '../lib/use-people-page-handlers'
import { PeopleContent } from './people-content'
import { PeopleEmpty } from './people-empty'

import './p-people.scss'

export const PPeople = () => {
  const { check, checkId } = useCurrentCheckFromRoute()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<TPerson | null>(null)
  const [personToDelete, setPersonToDelete] = useState<TPerson | null>(null)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)

  const { handleAddPerson, handleEditPerson, handleClearAll, handleOpenClearAll, handleConfirmDeletePerson } =
    usePeoplePageHandlers({
      checkId,
      editingPerson,
      personToDelete,
      setClearAllOpen: setIsClearAllOpen,
    })

  useRegisterNavAction(useCallback(() => setIsAddOpen(true), []))

  const people = check?.people ?? []

  if (!check) return null

  return (
    <div className="p-people">
      {people.length === 0 ? (
        <PeopleEmpty />
      ) : (
        <PeopleContent
          people={people}
          onEdit={setEditingPerson}
          onDeletePerson={setPersonToDelete}
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

      <FConfirmDelete
        isOpen={personToDelete != null}
        onClose={() => setPersonToDelete(null)}
        onConfirm={handleConfirmDeletePerson}
        title="Удалить участника?"
        message={`Участник «${personToDelete?.name}» будет удалён из чека.`}
      />
    </div>
  )
}
