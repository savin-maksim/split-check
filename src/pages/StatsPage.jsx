import StatisticsSection from '../layout/StatisticsSection/StatisticsSection'
import TransferSection from '../layout/TransferSection/TransferSection'
import { useApp } from '../context/AppContext'
import { useTransfers } from '../hooks/useTransfers'
import { useStatistics } from '../hooks/useStatistics'

function StatsPage() {
  const { people, costs, paymentMode } = useApp()
  const { transfers, isCalculating } = useTransfers(people, costs)
  const statistics = useStatistics(people, costs)

  return (
    <>
      <TransferSection 
        costs={costs}
        people={people}
        isLoading={isCalculating}
        transfers={transfers}
      />
      <StatisticsSection 
        people={people}
        costs={costs}
        transfers={transfers}
        paymentMode={paymentMode}
        isCalculating={isCalculating}
      />
    </>
  )
}

export default StatsPage 