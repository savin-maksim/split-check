import { Minus, Plus } from 'lucide-react'

import { cn } from '@/shared/lib'
import { IconButton, EIconButtonVariant } from '@/shared/ui/icon-button'

import './person-badge.scss'

type TPersonBadgeProps = {
  value: number
  label: string
  onDecrease: () => void
  onIncrease: () => void
  disabled?: boolean
  className?: string
}

export const PersonBadge = ({
  value,
  label,
  onDecrease,
  onIncrease,
  disabled,
  className,
  ...rest
}: TPersonBadgeProps) => {
  return (
    <div className={cn('person-badge', value > 0 && 'person-badge--active', className)} {...rest}>
      <IconButton
        variant={EIconButtonVariant.Wide}
        icon={<Minus className="person-badge__icon" size={'var(--button-icon-size)'} />}
        onClick={onDecrease}
        disabled={disabled}
        aria-label="Меньше"
      />
      <span className="person-badge__label">
        x{value} {label}
      </span>
      <IconButton
        variant={EIconButtonVariant.Wide}
        icon={<Plus className="person-badge__icon" size={'var(--button-icon-size)'} />}
        onClick={onIncrease}
        aria-label="Больше"
      />
    </div>
  )
}
