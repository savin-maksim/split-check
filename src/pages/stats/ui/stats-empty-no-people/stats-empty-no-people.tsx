import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'

import { PageHeader, EmptyState } from '@/shared/ui'
import { buildRoute } from '@/shared/constants'

type TStatsEmptyNoPeopleProps = {
  checkId: string
}

export const StatsEmptyNoPeople = ({ checkId }: TStatsEmptyNoPeopleProps) => (
  <>
    <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
    <EmptyState
      icon={<Users size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
      title="Добавьте участников"
    >
      <p>
        Перейдите на <Link to={buildRoute.people(checkId)}>страницу участников</Link> и добавьте людей
      </p>
    </EmptyState>
  </>
)
