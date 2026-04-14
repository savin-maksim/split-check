import type { ElementType, HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib'

import './item-card.scss'

type TItemCardProps = {
  as?: ElementType
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLElement>

export const ItemCard = ({ as: Tag = 'article', className, children, ...rest }: TItemCardProps) => {
  return (
    <Tag className={cn('item-card', className)} {...rest}>
      {children}
    </Tag>
  )
}
