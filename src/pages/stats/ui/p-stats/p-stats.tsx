import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Users, Calculator } from 'lucide-react'

import { useCurrentCheck, useCheckBalances, calculatePersonStats } from '@/entities/check'
import { WStatisticsPerson } from '@/widgets/w-statistics-person'
import { WStatisticsSummary } from '@/widgets/w-statistics-summary'
import { WTransfersCard } from '@/widgets/w-transfers-card'
import { FStatisticsShare } from '@/features/f-statistics-share'
import { PageHeader, EmptyState, Spinner } from '@/shared/ui'
import { useNavActionStore } from '@/shared/lib'
import { buildRoute } from '@/shared/constants'

import './p-stats.scss'

export const PStats = () => {
  const { check, checkId } = useCurrentCheck()
  const setNavAction = useNavActionStore((s) => s.setOnAction)
  const [isShareOpen, setIsShareOpen] = useState(false)

  useEffect(() => {
    setNavAction(() => setIsShareOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])
  const { balances, transfers } = useCheckBalances(check)

  if (!check) return null

  const personStats = calculatePersonStats(check, balances)

  if (check.people.length === 0) {
    return (
      <>
        <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
        <EmptyState
          icon={<Users size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
          title="Добавьте участников"
        >
          <p>
            Перейдите на <Link to={buildRoute.people(checkId)}>страницу участников</Link> и добавьте людей
          </p>
        </EmptyState>
      </>
    )
  }

  if (check.items.length === 0) {
    return (
      <>
        <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
        <EmptyState
          className="p-stats__empty-surface"
          icon={<Calculator size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
          title="Добавьте расходы"
        >
          <p>
            Перейдите на <Link to={buildRoute.items(checkId)}>страницу расходов</Link> и добавьте расходы
          </p>
        </EmptyState>
      </>
    )
  }

  if (transfers.length === 0) {
    return (
      <>
        <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Статистика" />
        <EmptyState icon={<Spinner />} title="Проверьте позиции">
          <p>Вероятно в одной из них не выбран плательщик и/или участник</p>
        </EmptyState>
      </>
    )
  }

  return (
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

      <FStatisticsShare isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  )
}
