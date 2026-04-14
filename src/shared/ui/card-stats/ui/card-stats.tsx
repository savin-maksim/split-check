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
      {icon}
      {value} {label}
    </span>
  )
}
