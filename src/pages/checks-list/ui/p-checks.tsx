import { useState, useEffect } from 'react'
import { Receipt } from 'lucide-react'

import { useCheckStore } from '@/entities/check'
import type { TCheck } from '@/entities/check'
import { FCreateCheck } from '@/features/f-create-check'
import { FEditCheck } from '@/features/f-edit-check'
import { FConfirmDelete } from '@/features/f-confirm-delete'
import { PageHeader } from '@/shared/ui'
import { pluralize, useNavActionStore } from '@/shared/lib'

import { useChecksListPageHandlers } from '../lib/use-checks-list-page-handlers'
import { ChecksContent } from './checks-content'
import { ChecksEmpty } from './checks-empty'

import './p-checks.scss'

export const PChecks = () => {
  const checks = useCheckStore((s) => s.checks)
  const currentCheckId = useCheckStore((s) => s.currentCheckId)
  const setNavAction = useNavActionStore((s) => s.setOnAction)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editCheck, setEditCheck] = useState<TCheck | null>(null)
  const [deleteCheck, setDeleteCheck] = useState<TCheck | null>(null)

  const { handleCreate, handleEditSubmit, handleDeleteConfirm, handleOpen } = useChecksListPageHandlers({
    editCheck,
    deleteCheck,
    setDeleteCheck,
  })

  useEffect(() => {
    setNavAction(() => setIsCreateOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])

  return (
    <div className="p-checks">
      <PageHeader
        icon={<Receipt aria-hidden="true" className="p-checks__icon" size={'var(--header-icon-size)'} />}
        title="Чеки"
        subtitle={
          checks.length > 0 ? `${checks.length} ${pluralize(checks.length, ['чек', 'чека', 'чеков'])}` : undefined
        }
      />

      {checks.length === 0 ? (
        <ChecksEmpty />
      ) : (
        <ChecksContent
          checks={checks}
          currentCheckId={currentCheckId}
          onOpen={handleOpen}
          onEdit={setEditCheck}
          onDelete={setDeleteCheck}
        />
      )}

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
    </div>
  )
}
