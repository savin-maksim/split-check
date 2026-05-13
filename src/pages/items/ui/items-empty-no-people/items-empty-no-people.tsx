import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'

import { WPageEmpty } from '@widgets/w-page-empty'
import { buildRoute } from '@shared/constants'

type TItemsEmptyNoPeopleProps = {
  checkId: string
}

export const ItemsEmptyNoPeople = ({ checkId }: TItemsEmptyNoPeopleProps) => (
  <WPageEmpty
    pageTitle="Расходы"
    pageIcon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />}
    emptyIcon={<Users size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
    emptyTitle="Добавьте участников"
  >
    <p>
      Перейдите на <Link to={buildRoute.people(checkId)}>страницу участников</Link> и добавьте людей
    </p>
  </WPageEmpty>
)
