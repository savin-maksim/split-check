import { memo, useCallback } from 'react'
import { Minus, Plus } from 'lucide-react'

import { IconButton, EIconButtonVariant } from '@/shared/ui/icon-button'

import './qty-stepper.scss'

type TQtyStepperProps = {
  qty: number
  canDecreaseQty: boolean
  priceFormatted: string
  onAdjust: (delta: number) => void
}

const QtyStepperComponent = ({ qty, canDecreaseQty, priceFormatted, onAdjust }: TQtyStepperProps) => {
  const onDec = useCallback(() => onAdjust(-1), [onAdjust])
  const onInc = useCallback(() => onAdjust(1), [onAdjust])

  return (
    <div className="qty-stepper" role="group" aria-label="Количество">
      <IconButton
        icon={<Minus size={'var(--button-icon-size)'} />}
        variant={EIconButtonVariant.Qty}
        onClick={onDec}
        disabled={!canDecreaseQty}
        aria-label="Уменьшить количество"
      />
      <span className="qty-stepper__value">{qty}</span>
      <IconButton
        icon={<Plus size={'var(--button-icon-size)'} />}
        variant={EIconButtonVariant.Qty}
        onClick={onInc}
        aria-label="Увеличить количество"
      />
      <span className="qty-stepper__formula">× {priceFormatted}</span>
    </div>
  )
}

export const QtyStepper = memo(QtyStepperComponent)
QtyStepper.displayName = 'QtyStepper'
