import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { useCheckStore } from '@entities/check'
import type { TCheck } from '@entities/check'
import { buildRoute } from '@shared/constants'

type TUseChecksListPageHandlersParams = {
  editCheck: TCheck | null
  deleteCheck: TCheck | null
  setDeleteCheck: (check: TCheck | null) => void
}

export const useChecksListPageHandlers = ({
  editCheck,
  deleteCheck,
  setDeleteCheck,
}: TUseChecksListPageHandlersParams) => {
  const navigate = useNavigate()
  const addCheck = useCheckStore((s) => s.addCheck)
  const removeCheck = useCheckStore((s) => s.removeCheck)
  const updateCheckTitle = useCheckStore((s) => s.updateCheckTitle)
  const loadCheck = useCheckStore((s) => s.loadCheck)

  const handleCreate = useCallback(
    (title: string) => {
      const id = addCheck(title)
      navigate(buildRoute.people(id))
    },
    [addCheck, navigate],
  )

  const handleEditSubmit = useCallback(
    (title: string) => {
      if (!editCheck) return
      updateCheckTitle(editCheck.id, title)
      toast.success('Название обновлено')
    },
    [editCheck, updateCheckTitle],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteCheck) return
    removeCheck(deleteCheck.id)
    toast.success('Чек удалён')
    setDeleteCheck(null)
  }, [deleteCheck, removeCheck, setDeleteCheck])

  const handleOpen = useCallback(
    (check: TCheck) => {
      loadCheck(check.id)
      navigate(buildRoute.people(check.id))
    },
    [loadCheck, navigate],
  )

  return { handleCreate, handleEditSubmit, handleDeleteConfirm, handleOpen }
}
