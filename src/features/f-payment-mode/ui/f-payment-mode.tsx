import { memo } from 'react'

import { ToggleGroup } from '@/shared/ui'
import { EPaymentMode } from '@/entities/check'
import { Users, User } from 'lucide-react'

import './f-payment-mode.scss'

const PAYMENT_OPTIONS = [
  {
    value: EPaymentMode.Single,
    label: 'Единственный',
    icon: <User aria-hidden="true" className="f-payment-mode__icon" size={'var(--button-icon-size)'} />,
  },
  {
    value: EPaymentMode.Manual,
    label: 'Множество',
    icon: <Users aria-hidden="true" className="f-payment-mode__icon" size={'var(--button-icon-size)'} />,
  },
]

type TFPaymentModeProps = {
  value: EPaymentMode
  onChange: (mode: EPaymentMode) => void
  className?: string
}

export const FPaymentMode = memo(({ value, onChange, className }: TFPaymentModeProps) => {
  return (
    <ToggleGroup
      options={PAYMENT_OPTIONS}
      value={value}
      onChange={onChange}
      className={className}
      label="Режим плательщиков"
    />
  )
})
FPaymentMode.displayName = 'FPaymentMode'
