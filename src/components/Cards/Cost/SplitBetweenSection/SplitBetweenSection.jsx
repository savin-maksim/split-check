import { ChartPie } from 'lucide-react'
import IconButton from '@/components/Button/IconButton'
import PersonGrid from '@/components/Cards/Cost/PersonGrid/PersonGrid'
import PersonGridWeights from '@/components/Cards/Cost/PersonGrid/PersonGridWeights'
import './split-between-section.scss'

export default function SplitBetweenSection({
  people,
  distributionType,
  splitBetween,
  weights,
  onToggle,
  onToggleDistribution,
  onAdjustWeight,
}) {
  return (
    <div className="split-between-section">
      <div className="split-between-section__label">
        <p className="">На кого разделить?</p>
        <IconButton
          icon={<ChartPie />}
          variant={distributionType === 'weighted' ? 'active' : ''}
          onClick={onToggleDistribution}
          aria-label={distributionType === 'weighted' ? 'Переключить на равные доли' : 'Переключить на доли по весам'}
        />
      </div>

      {distributionType === 'equal' ? (
        <PersonGrid people={people} selected={splitBetween} onToggle={onToggle} />
      ) : (
        <PersonGridWeights people={people} weights={weights} onAdjustWeight={onAdjustWeight} />
      )}
    </div>
  )
}
