import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

import { useCheckStore } from '@/entities/check'
import type { TPerson } from '@/entities/check'
import { parseBulkPersonNames, pluralize } from '@/shared/lib'

type TUsePeoplePageHandlersParams = {
  checkId: string
  editingPerson: TPerson | null
  personToDelete: TPerson | null
  setClearAllOpen: (open: boolean) => void
}

export const usePeoplePageHandlers = ({
  checkId,
  editingPerson,
  personToDelete,
  setClearAllOpen,
}: TUsePeoplePageHandlersParams) => {
  const addPeople = useCheckStore((s) => s.addPeople)
  const removeAllPeople = useCheckStore((s) => s.removeAllPeople)
  const removePerson = useCheckStore((s) => s.removePerson)
  const updatePerson = useCheckStore((s) => s.updatePerson)

  const handleAddPerson = useCallback(
    (name: string) => {
      const names = parseBulkPersonNames(name)
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

  const handleOpenClearAll = useCallback(() => {
    setClearAllOpen(true)
  }, [setClearAllOpen])

  const handleConfirmDeletePerson = useCallback(() => {
    if (!personToDelete) return
    removePerson(checkId, personToDelete.id)
    toast.success(`Удален участник: ${personToDelete.name}`)
  }, [personToDelete, removePerson, checkId])

  return {
    handleAddPerson,
    handleEditPerson,
    handleClearAll,
    handleOpenClearAll,
    handleConfirmDeletePerson,
  }
}
