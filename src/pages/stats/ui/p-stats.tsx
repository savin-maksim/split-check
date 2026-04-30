import { useCurrentCheck, useCheckBalances, calculatePersonStats } from '@/entities/check'
import { FStatisticsShare } from '@/features/f-statistics-share'

import { useStatsPage } from '../lib/use-stats-page'
import { StatsContent } from './stats-content'
import { StatsEmptyNoItems } from './stats-empty-no-items'
import { StatsEmptyNoPeople } from './stats-empty-no-people'
import { StatsEmptyNoTransfers } from './stats-empty-no-transfers'

import './p-stats.scss'

export const PStats = () => {
  const { check, checkId } = useCurrentCheck()
  const { isShareOpen, setIsShareOpen } = useStatsPage()
  const { balances, transfers } = useCheckBalances(check)

  if (!check) return null

  const noPeople = check.people.length === 0
  const noItems = check.items.length === 0
  const noTransfers = transfers.length === 0

  const personStats = !noPeople && !noItems && !noTransfers ? calculatePersonStats(check, balances) : []

  return (
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
  )
}
