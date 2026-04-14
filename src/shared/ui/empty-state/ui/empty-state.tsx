import type { ElementType, ReactNode } from 'react'

import { cn } from '@/shared/lib'

import './empty-state.scss'

type TEmptyStateProps = {
  className?: string
  icon?: ReactNode
  title?: string
  titleAs?: 'h2' | 'h3'
  muted?: boolean
  children?: ReactNode
  actions?: ReactNode
}

export const EmptyState = ({
  className,
  icon,
  title,
  titleAs = 'h2',
  muted = false,
  children,
  actions,
}: TEmptyStateProps) => {
  const TitleTag: ElementType = titleAs

  return (
    <div className={cn('empty-state', muted && 'empty-state--muted', className)}>
      {icon ? (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      {title ? <TitleTag className="empty-state__title">{title}</TitleTag> : null}
      {children}
      {actions ? <div className="empty-state__actions">{actions}</div> : null}
    </div>
  )
}
