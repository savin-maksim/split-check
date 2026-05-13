import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@shared/lib'

import './icon-button.scss'

export enum EIconButtonVariant {
  Danger = 'danger',
  Active = 'active',
  Wide = 'wide',
  Qty = 'qty',
  Scanner = 'scanner',
}

const variantClass: Record<EIconButtonVariant, string> = {
  [EIconButtonVariant.Danger]: 'icon-button--danger',
  [EIconButtonVariant.Active]: 'icon-button--active',
  [EIconButtonVariant.Wide]: 'icon-button--wide',
  [EIconButtonVariant.Qty]: 'icon-button--qty',
  [EIconButtonVariant.Scanner]: 'icon-button--scanner',
}

export type TIconButtonProps = {
  icon: ReactNode
  variant?: EIconButtonVariant
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export const IconButton = ({
  onClick,
  className,
  icon,
  title,
  variant,
  'aria-label': ariaLabel,
  ...rest
}: TIconButtonProps) => {
  const variantModifier = variant != null ? variantClass[variant] : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('icon-button', variantModifier, className)}
      title={title}
      aria-label={ariaLabel}
      {...rest}
    >
      {icon}
    </button>
  )
}
