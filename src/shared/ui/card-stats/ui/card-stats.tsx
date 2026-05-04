import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'

import './card-stats.scss'

type TCardStatsProps = {
  icon: ReactNode
  value: string | number
  label?: string
  className?: string
}

export const CardStats = ({ icon, value, label, className, ...rest }: TCardStatsProps) => {
  return (
    <span className={cn('card-stats', className)} {...rest}>
      <span aria-hidden="true" className="card-stats__icon">
        {icon}
      </span>
      {value} {label}
    </span>
  )
}
