import { ToggleGroup } from '@/shared/ui'
import { EPaymentMode } from '@/entities/check'

import './f-payment-mode.scss'

const PAYMENT_OPTIONS = [
  { value: EPaymentMode.Manual, label: 'Вручную' },
  { value: EPaymentMode.Single, label: 'Один платит' },
]

type TFPaymentModeProps = {
  value: EPaymentMode
  onChange: (mode: EPaymentMode) => void
  className?: string
}

export const FPaymentMode = ({ value, onChange, className }: TFPaymentModeProps) => {
  return (
    <ToggleGroup
      options={PAYMENT_OPTIONS}
      value={value}
      onChange={onChange}
      className={className}
      label="Режим оплаты"
    />
  )
}
