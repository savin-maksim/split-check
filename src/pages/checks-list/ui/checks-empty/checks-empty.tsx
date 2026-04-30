import { FilePlus } from 'lucide-react'

import { EmptyState } from '@/shared/ui'

export const ChecksEmpty = () => (
  <EmptyState
    className="p-checks-list__empty"
    icon={<FilePlus size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
    title="Создайте первый чек"
  >
    <p>Нажмите на кнопку в навигационной панели, чтобы создать чек</p>
  </EmptyState>
)
