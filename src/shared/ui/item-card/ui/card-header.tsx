import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'

import { MarqueeTitle } from '@/shared/ui/marquee-title'

type TCardHeaderProps = {
  title: ReactNode
  actions?: ReactNode
  className?: string
}

export const CardHeader = ({ title, actions, className }: TCardHeaderProps) => (
  <div className={cn('item-card__header', className)}>
    <MarqueeTitle as="h3">{title}</MarqueeTitle>
    {actions && <div className="item-card__actions">{actions}</div>}
  </div>
)
