import { Minus, Plus } from 'lucide-react'
import IconButton from '@/components/Button/IconButton'
import './qty-stepper.scss'

function QtyStepper({ qty, canDecreaseQty, pricePerUnit, formatAmount, adjustQuantity }) {
  return (
    <div className="qty-stepper" role="group" aria-label="Количество">
      <IconButton
        icon={<Minus size={16} />}
        className="icon-button--qty"
        onClick={() => adjustQuantity(-1)}
        disabled={!canDecreaseQty}
        aria-label="Уменьшить количество"
      />
      <span className="qty-stepper__value">{qty}</span>
      <IconButton
        icon={<Plus size={16} />}
        className="icon-button--qty"
        onClick={() => adjustQuantity(1)}
        aria-label="Увеличить количество"
      />
      <span className="calculation-formula">× {formatAmount(pricePerUnit || 0)}</span>
    </div>
  )
}

export default QtyStepper
