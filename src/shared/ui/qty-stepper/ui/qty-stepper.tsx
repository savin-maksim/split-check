import { Minus, Plus } from 'lucide-react'

import { IconButton, EIconButtonVariant } from '@/shared/ui/icon-button'

import './qty-stepper.scss'

type TQtyStepperProps = {
  qty: number
  canDecreaseQty: boolean
  priceFormatted: string
  onAdjust: (delta: number) => void
}

export const QtyStepper = ({ qty, canDecreaseQty, priceFormatted, onAdjust }: TQtyStepperProps) => {
  return (
    <div className="qty-stepper" role="group" aria-label="Количество">
      <IconButton
        icon={<Minus size={'var(--button-icon-size)'} />}
        variant={EIconButtonVariant.Qty}
        onClick={() => onAdjust(-1)}
        disabled={!canDecreaseQty}
        aria-label="Уменьшить количество"
      />
      <span className="qty-stepper__value">{qty}</span>
      <IconButton
        icon={<Plus size={'var(--button-icon-size)'} />}
        variant={EIconButtonVariant.Qty}
        onClick={() => onAdjust(1)}
        aria-label="Увеличить количество"
      />
      <span className="qty-stepper__formula">× {priceFormatted}</span>
    </div>
  )
}
