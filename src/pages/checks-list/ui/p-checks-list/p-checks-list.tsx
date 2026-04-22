import { useState, useCallback, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, FilePlus } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useCheckStore } from '@/entities/check'
import type { TCheck } from '@/entities/check'
import { WCheckCard } from '@/widgets/w-check-card'
import { FCreateCheck } from '@/features/f-create-check'
import { FEditCheck } from '@/features/f-edit-check'
import { FConfirmDelete } from '@/features/f-confirm-delete'
import { PageHeader, EmptyState } from '@/shared/ui'
import { pluralize, useNavActionStore } from '@/shared/lib'
import { buildRoute } from '@/shared/constants'

import './p-checks-list.scss'

type TChecksContentProps = {
  checks: TCheck[]
  currentCheckId: string | null
  onOpen: (check: TCheck) => void
  onEdit: (check: TCheck) => void
  onDelete: (check: TCheck) => void
}

const ChecksContent = memo(({ checks, currentCheckId, onOpen, onEdit, onDelete }: TChecksContentProps) => {
  return (
    <ul className="list-layout">
      {checks.map((check) => (
        <WCheckCard
          key={check.id}
          check={check}
          isActive={currentCheckId === check.id}
          onOpen={() => onOpen(check)}
          onEdit={() => onEdit(check)}
          onDelete={() => onDelete(check)}
        />
      ))}
    </ul>
  )
})
ChecksContent.displayName = 'ChecksContent'

export const PChecksList = () => {
  const checks = useCheckStore((s) => s.checks)
  const currentCheckId = useCheckStore((s) => s.currentCheckId)
  const addCheck = useCheckStore((s) => s.addCheck)
  const removeCheck = useCheckStore((s) => s.removeCheck)
  const updateCheckTitle = useCheckStore((s) => s.updateCheckTitle)
  const loadCheck = useCheckStore((s) => s.loadCheck)
  const setNavAction = useNavActionStore((s) => s.setOnAction)
  const navigate = useNavigate()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editCheck, setEditCheck] = useState<TCheck | null>(null)
  const [deleteCheck, setDeleteCheck] = useState<TCheck | null>(null)

  useEffect(() => {
    setNavAction(() => setIsCreateOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])

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
  }, [deleteCheck, removeCheck])

  const handleOpen = useCallback(
    (check: TCheck) => {
      loadCheck(check.id)
      navigate(buildRoute.people(check.id))
    },
    [loadCheck, navigate],
  )

  return (
    <>
      <PageHeader
        icon={<Receipt size={'var(--header-icon-size)'} aria-hidden="true" />}
        title="Чеки"
        subtitle={
          checks.length > 0 ? `${checks.length} ${pluralize(checks.length, ['чек', 'чека', 'чеков'])}` : undefined
        }
      />

      <>
        {checks.length === 0 ? (
          <EmptyState
            icon={<FilePlus size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
            title="Создайте первый чек"
          >
            <p>Нажмите на кнопку в навигационной панели, чтобы создать чек</p>
          </EmptyState>
        ) : (
          <ChecksContent
            checks={checks}
            currentCheckId={currentCheckId}
            onOpen={handleOpen}
            onEdit={setEditCheck}
            onDelete={setDeleteCheck}
          />
        )}
      </>

      <FCreateCheck isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSubmit={handleCreate} />

      <FEditCheck
        isOpen={editCheck != null}
        onClose={() => setEditCheck(null)}
        initialTitle={editCheck?.title ?? ''}
        onSubmit={handleEditSubmit}
      />

      <FConfirmDelete
        isOpen={deleteCheck != null}
        onClose={() => setDeleteCheck(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить чек?"
        message={`Чек «${deleteCheck?.title}» будет удалён без возможности восстановления.`}
      />
    </>
  )
}
