import { forwardRef, memo } from 'react'
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

const ButtonInner = forwardRef<HTMLButtonElement, TButtonProps>(
  ({ onClick, disabled = false, className, icon, children, title, type = 'button', variant, ...rest }, ref) => {
    const variantModifier = variant != null ? variantClass[variant] : null

    return (
      <button
        ref={ref}
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
        {children != null && children !== false && <span className="button__label">{children}</span>}
      </button>
    )
  },
)
ButtonInner.displayName = 'Button'

export const Button = memo(ButtonInner)
Button.displayName = 'Button'
