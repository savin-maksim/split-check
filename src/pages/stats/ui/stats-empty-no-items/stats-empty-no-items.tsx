import { Link } from 'react-router-dom'
import { Users, Calculator } from 'lucide-react'

import { PageHeader, EmptyState } from '@/shared/ui'
import { buildRoute } from '@/shared/constants'

type TStatsEmptyNoItemsProps = {
  checkId: string
}

export const StatsEmptyNoItems = ({ checkId }: TStatsEmptyNoItemsProps) => (
  <>
    <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
    <EmptyState icon={<Calculator size={'var(--empty-state-icon-size)'} aria-hidden="true" />} title="Добавьте расходы">
      <p>
        Перейдите на <Link to={buildRoute.items(checkId)}>страницу расходов</Link> и добавьте расходы
      </p>
    </EmptyState>
  </>
)
