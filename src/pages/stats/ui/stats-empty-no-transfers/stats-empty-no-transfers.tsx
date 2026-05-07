import { Users } from 'lucide-react'

import { WPageEmpty } from '@/widgets/w-page-empty'
import { Spinner } from '@/shared/ui'

export const StatsEmptyNoTransfers = () => (
  <WPageEmpty
    pageTitle="Статистика"
    pageIcon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />}
    emptyIcon={<Spinner />}
    emptyTitle="Проверьте позиции"
  >
    <p>Вероятно в одной из них не выбран плательщик и/или участник</p>
  </WPageEmpty>
)
