import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import IconButton from '@/components/Button/IconButton'
import PersonGrid from '@/components/Cards/Cost/PersonGrid/PersonGrid'
import './who-paid-section.scss'

export default function WhoPaidSection({ people, paidBy, expanded, onToggle, onPersonToggle }) {
  return (
    <div className="who-paid-section">
      <div className={`who-paid-section__label${expanded ? '' : ' who-paid-section__label--collapsed'}`}>
        <span>Кто платил?</span>
        {!expanded && paidBy.length > 0 && (
          <span className="who-paid-section__label-picked">{paidBy.map((p) => p.name)}</span>
        )}
        <IconButton
          icon={expanded ? <ChevronsDownUp /> : <ChevronsUpDown />}
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? 'Скрыть список' : 'Показать список'}
          title={expanded ? 'Скрыть список' : 'Показать список'}
        />
      </div>
      <div className={`who-paid-section__collapse${expanded ? ' who-paid-section__collapse--open' : ''}`}>
        <div className="who-paid-section__collapse-inner">
          <PersonGrid people={people} selected={paidBy} onToggle={onPersonToggle} />
        </div>
      </div>
    </div>
  )
}
