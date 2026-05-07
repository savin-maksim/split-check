import { UserPlus, Users } from 'lucide-react'

import { WPageEmpty } from '@/widgets/w-page-empty'

export const PeopleEmpty = () => (
  <WPageEmpty
    pageTitle="Участники"
    pageIcon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />}
    emptyIcon={<UserPlus size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
    emptyTitle="Добавьте участников"
  >
    <p>Нажмите на кнопку в навигационной панели, чтобы добавить людей, между которыми нужно разделить расходы</p>
  </WPageEmpty>
)
