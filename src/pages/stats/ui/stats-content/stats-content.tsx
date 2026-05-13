import { memo, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'

import type { TCheck, TTransfer, TPersonStats } from '@entities/check'
import { WStatisticsPerson } from '@widgets/w-statistics-person'
import { WStatisticsSummary } from '@widgets/w-statistics-summary'
import { WTransfersCard } from '@widgets/w-transfers-card'
import { PageHeader, AnimatedListPresence, AnimatedBlock } from '@shared/ui'
import { animatedBlockMotion, getPersonStatsAnchorId } from '@shared/lib'

type TStatsContentProps = {
  check: TCheck
  transfers: TTransfer[]
  personStats: TPersonStats[]
}

export const StatsContent = memo(({ check, transfers, personStats }: TStatsContentProps) => {
  const visiblePersonStats = useMemo(() => personStats.filter((p) => p.expenses.length > 0), [personStats])

  return (
    <>
      <PageHeader icon={<BarChart3 size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
      <AnimatedBlock className="p-stats__reveal" blockMotion={animatedBlockMotion}>
        <WTransfersCard checkId={check.id} people={check.people} transfers={transfers} isLoading={false} />
      </AnimatedBlock>

      <div className="list-layout">
        <AnimatedBlock className="p-stats__reveal-grid-cell" blockMotion={animatedBlockMotion} initialDelay={0.05}>
          <WStatisticsSummary items={check.items} />
        </AnimatedBlock>

        <AnimatedListPresence
          initialDelay={0.1}
          staggerDelay={0.05}
          items={visiblePersonStats}
          getKey={(person) => person.id}
          getItemDomId={(person) => getPersonStatsAnchorId(check.id, person.id)}
          renderItem={(person) => <WStatisticsPerson person={person} />}
        />
      </div>
    </>
  )
})
StatsContent.displayName = 'StatsContent'
