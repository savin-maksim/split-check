import { Users } from 'lucide-react'

import { PageHeader, EmptyState, Spinner } from '@/shared/ui'

export const StatsEmptyNoTransfers = () => (
  <>
    <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
    <EmptyState icon={<Spinner />} title="Проверьте позиции">
      <p>Вероятно в одной из них не выбран плательщик и/или участник</p>
    </EmptyState>
  </>
)
