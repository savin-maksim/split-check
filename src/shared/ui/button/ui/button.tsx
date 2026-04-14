import { memo } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib'

import './button.scss'

export enum EButtonVariant {
  Danger = 'danger',
  Active = 'active',
  Wide = 'wide',
  Full = 'full',
  Weight = 'weight',
}

const variantClass: Record<EButtonVariant, string> = {
  [EButtonVariant.Danger]: 'button--danger',
  [EButtonVariant.Active]: 'button--active',
  [EButtonVariant.Wide]: 'button--wide',
  [EButtonVariant.Full]: 'button--full',
  [EButtonVariant.Weight]: 'button--weight',
}

export type TButtonProps = {
  icon?: ReactNode
  variant?: EButtonVariant
} & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = memo(
  ({
    onClick,
    disabled = false,
    className,
    icon,
    children,
    title,
    type = 'button',
    variant,
    ...rest
  }: TButtonProps) => {
    const variantModifier = variant != null ? variantClass[variant] : null

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn('button', variantModifier, className)}
        {...rest}
      >
        {icon != null && icon !== false && (
          <span className="button__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="button__label">{children}</span>
      </button>
    )
  },
)
Button.displayName = 'Button'
