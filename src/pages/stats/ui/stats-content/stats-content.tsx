import { motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'

import type { TCheck, TTransfer, TPersonStats } from '@/entities/check'
import { WStatisticsPerson } from '@/widgets/w-statistics-person'
import { WStatisticsSummary } from '@/widgets/w-statistics-summary'
import { WTransfersCard } from '@/widgets/w-transfers-card'
import { PageHeader, AnimatedListPresence } from '@/shared/ui'

const cardEase = [0.4, 0, 0.2, 1] as const
const cardDuration = 0.22

const cardEnter = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: cardDuration, ease: cardEase },
}

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
      <motion.div className="p-stats__reveal" {...cardEnter} transition={{ ...cardEnter.transition }}>
        <WTransfersCard transfers={transfers} isLoading={false} />
      </motion.div>

      <div className="list-layout">
        <motion.div className="p-stats__reveal-grid-cell" {...cardEnter} transition={{ ...cardEnter.transition }}>
          <WStatisticsSummary items={check.items} />
        </motion.div>

        <AnimatedListPresence
          items={visiblePersonStats}
          getKey={(person) => person.id}
          renderItem={(person) => <WStatisticsPerson person={person} />}
        />
      </div>
    </>
  )
})
StatsContent.displayName = 'StatsContent'
