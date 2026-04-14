import { Users, Calculator, Receipt } from 'lucide-react'

import type { TCheck } from '@/entities/check'
import { getItemTotal } from '@/entities/check'

import { formatMoney, pluralize } from '@/shared/lib'
import { StatsCard, CardStats } from '@/shared/ui'

import './w-total-card.scss'

type TWTotalCardProps = {
  check: TCheck | undefined
}

export const WTotalCard = ({ check }: TWTotalCardProps) => {
  if (!check) return null

  const peopleCount = check.people.length
  const itemsCount = check.items.length
  const totalKopecks = check.items.reduce((sum, item) => sum + getItemTotal(item), 0)

  return (
    <StatsCard title="Общая сумма" className="w-total-card">
      <h3 className="w-total-card__amount">{formatMoney(totalKopecks)}</h3>

      <div className="w-total-card__stats">
        <CardStats
          icon={<Users size={18} aria-hidden="true" />}
          value={peopleCount}
          label={pluralize(peopleCount, ['человек', 'человека', 'человек'])}
        />
        <CardStats
          icon={<Calculator size={18} aria-hidden="true" />}
          value={itemsCount}
          label={pluralize(itemsCount, ['позиция', 'позиции', 'позиций'])}
        />
        <CardStats icon={<Receipt size={18} aria-hidden="true" />} value={formatMoney(totalKopecks)} />
      </div>
    </StatsCard>
  )
}
