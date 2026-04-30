import { useState, useEffect } from 'react'

import { useCurrentCheck } from '@/entities/check'
import type { TPerson } from '@/entities/check'
import { FManagePerson } from '@/features/f-manage-person'
import { FConfirmDelete } from '@/features/f-confirm-delete'
import { useNavActionStore } from '@/shared/lib'

import { usePeoplePageHandlers } from '../lib/use-people-page-handlers'
import { PeopleContent } from './people-content'
import { PeopleEmpty } from './people-empty'

import './p-people.scss'

export const PPeople = () => {
  const { check, checkId } = useCurrentCheck()
  const setNavAction = useNavActionStore((s) => s.setOnAction)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<TPerson | null>(null)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)

  const { handleAddPerson, handleEditPerson, handleClearAll, handleOpenClearAll } = usePeoplePageHandlers({
    checkId,
    editingPerson,
    setClearAllOpen: setIsClearAllOpen,
  })

  useEffect(() => {
    setNavAction(() => setIsAddOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])

  const people = check?.people ?? []

  if (!check) return null

  return (
    <div className="p-people">
      {people.length === 0 ? (
        <PeopleEmpty />
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
    </div>
  )
}
