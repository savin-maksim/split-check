import { Link } from 'react-router-dom'
import { Calculator } from 'lucide-react'

import { WPageEmpty } from '@/widgets/w-page-empty'
import { buildRoute } from '@/shared/constants'

type TStatsEmptyNoItemsProps = {
  checkId: string
}

export const StatsEmptyNoItems = ({ checkId }: TStatsEmptyNoItemsProps) => (
  <WPageEmpty
    pageTitle="Статистика"
    pageIcon={<Calculator size={'var(--header-icon-size)'} aria-hidden="true" />}
    emptyIcon={<Calculator size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
    emptyTitle="Добавьте расходы"
  >
    <p>
      Перейдите на <Link to={buildRoute.items(checkId)}>страницу расходов</Link> и добавьте расходы
    </p>
  </WPageEmpty>
)
