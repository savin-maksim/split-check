import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

import { useCheckStore, validatePersonName } from '@entities/check'
import type { TPerson } from '@entities/check'
import { parseBulkPersonNames, pluralize } from '@shared/lib'

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
      if (names.length === 0) return validatePersonName(name) ?? 'Введите имя участника'

      const result = addPeople(checkId, names)
      if (!result.ok) return result.error

      const addedMessage = `Добавлено: ${result.addedCount} ${pluralize(result.addedCount, ['человек', 'человека', 'человек'])}`
      if (result.skippedCount > 0) {
        toast.success(`${addedMessage}. Пропущено: ${result.skippedCount}`)
      } else {
        toast.success(addedMessage)
      }
    },
    [addPeople, checkId],
  )

  const handleEditPerson = useCallback(
    (name: string) => {
      if (!editingPerson) return

      const result = updatePerson(checkId, editingPerson.id, name)
      if (!result.ok) return result.error

      toast.success('Имя обновлено')
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
