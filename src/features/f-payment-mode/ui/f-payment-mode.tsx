import { ToggleGroup } from '@/shared/ui'
import { EPaymentMode } from '@/entities/check'
import { Users, User } from 'lucide-react'

import './f-payment-mode.scss'

const PAYMENT_OPTIONS = [
  { value: EPaymentMode.Manual, label: 'Множество', icon: <Users aria-hidden="true" /> },
  { value: EPaymentMode.Single, label: 'Единый', icon: <User aria-hidden="true" /> },
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
