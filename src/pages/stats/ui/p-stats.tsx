import { useCheckBalances, calculatePersonStats } from '@/entities/check'
import { FStatisticsShare, StatShareProvider } from '@/features/f-statistics-share'
import { useCurrentCheckFromRoute } from '@/shared/lib'

import { useStatsPageHandlers } from '../lib/use-stats-page-handlers'
import { StatsContent } from './stats-content'
import { StatsEmptyNoItems } from './stats-empty-no-items'
import { StatsEmptyNoPeople } from './stats-empty-no-people'
import { StatsEmptyNoTransfers } from './stats-empty-no-transfers'

import './p-stats.scss'

export const PStats = () => {
  const { check, checkId } = useCurrentCheckFromRoute()
  const { isShareOpen, setIsShareOpen } = useStatsPageHandlers()
  const { balances, transfers } = useCheckBalances(check)

  if (!check) return null

  const noPeople = check.people.length === 0
  const noItems = check.items.length === 0
  const noTransfers = transfers.length === 0

  const personStats = !noPeople && !noItems && !noTransfers ? calculatePersonStats(check, balances) : []

  return (
    <StatShareProvider>
      <div className="p-stats">
        {noPeople ? (
          <StatsEmptyNoPeople checkId={checkId} />
        ) : noItems ? (
          <StatsEmptyNoItems checkId={checkId} />
        ) : noTransfers ? (
          <StatsEmptyNoTransfers />
        ) : (
          <StatsContent check={check} transfers={transfers} personStats={personStats} />
        )}

        {!noPeople && !noItems && !noTransfers && (
          <FStatisticsShare isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        )}
      </div>
    </StatShareProvider>
  )
}
