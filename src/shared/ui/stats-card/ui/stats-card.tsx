import type { ReactNode } from 'react'

import { cn } from '@shared/lib'

import './stats-card.scss'

type TStatsCardProps = {
  title?: string
  children: ReactNode
  className?: string
}

export const StatsCard = ({ title, children, className }: TStatsCardProps) => {
  return (
    <div className={cn('stats-card', className)}>
      {title && <h3 className="stats-card__title">{title}</h3>}
      <div className="stats-card__content">{children}</div>
    </div>
  )
}
