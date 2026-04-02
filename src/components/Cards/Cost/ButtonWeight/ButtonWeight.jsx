import { Minus, Plus } from 'lucide-react'
import IconButton from '@/components/Button/IconButton'
import '@/components/Button/button.scss'

export default function ButtonWeight({ value, label, onDecrease, onIncrease, disabled, ...rest }) {
  return (
    <div className={['button button--weight', value > 0 ? 'button--active' : ''].filter(Boolean).join(' ')} {...rest}>
      <IconButton
        variant="wide"
        icon={<Minus size={16} />}
        onClick={onDecrease}
        disabled={disabled}
        aria-label="Меньше"
      />
      <span className="button__label">
        x{value} {label}
      </span>
      <IconButton
        variant="wide"
        icon={<Plus size={16} />}
        onClick={onIncrease}
        aria-label="Больше"
      />
    </div>
  )
}
