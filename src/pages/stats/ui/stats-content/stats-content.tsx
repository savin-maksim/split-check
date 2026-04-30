import { memo } from 'react'
import { BarChart3 } from 'lucide-react'

import type { TCheck, TTransfer, TPersonStats } from '@/entities/check'
import { WStatisticsPerson } from '@/widgets/w-statistics-person'
import { WStatisticsSummary } from '@/widgets/w-statistics-summary'
import { WTransfersCard } from '@/widgets/w-transfers-card'
import { PageHeader } from '@/shared/ui'

type TStatsContentProps = {
  check: TCheck
  transfers: TTransfer[]
  personStats: TPersonStats[]
}

export const StatsContent = memo(({ check, transfers, personStats }: TStatsContentProps) => (
  <>
    <PageHeader icon={<BarChart3 size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
    <WTransfersCard transfers={transfers} isLoading={false} />

    <div className="list-layout">
      <WStatisticsSummary items={check.items} />

      {personStats.map((person) => {
        if (person.expenses.length === 0) return null

        return <WStatisticsPerson key={person.id} person={person} />
      })}
    </div>
  </>
))
StatsContent.displayName = 'StatsContent'
