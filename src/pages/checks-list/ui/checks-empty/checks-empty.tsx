import { FilePlus } from 'lucide-react'

import { EmptyState } from '@/shared/ui'

export const ChecksEmpty = () => (
  <EmptyState icon={<FilePlus aria-hidden="true" size={'var(--empty-state-icon-size)'} />} title="Создайте первый чек">
    <p>Нажмите на кнопку в навигационной панели, чтобы создать чек</p>
  </EmptyState>
)
