import { AnimatePresence, motion } from 'framer-motion'
import type { HTMLAttributes, Key, ReactNode } from 'react'

import { animatedListItemMotion, animatedListTransition } from '@shared/lib'

import './animated-list.scss'

type TAnimatedListPresenceProps<T> = {
  items: readonly T[]
  getKey: (item: T) => Key
  renderItem: (item: T) => ReactNode
  getItemDomId?: (item: T) => string | undefined
  itemAs?: 'div' | 'li'
  itemClassName?: string
  initialDelay?: number
  staggerDelay?: number
  initialEnter?: boolean
}

export const AnimatedListPresence = <T,>({
  items,
  getKey,
  renderItem,
  getItemDomId,
  itemAs = 'div',
  itemClassName,
  initialDelay = 0,
  staggerDelay = 0,
  initialEnter = true,
}: TAnimatedListPresenceProps<T>) => {
  const MotionItem = itemAs === 'li' ? motion.li : motion.div
  const cellClass = itemClassName ?? 'animated-list__item'

  return (
    <AnimatePresence mode="popLayout" initial={initialEnter}>
      {items.map((item, index) => (
        <MotionItem
          key={getKey(item)}
          id={getItemDomId?.(item)}
          layout
          className={cellClass}
          initial={animatedListItemMotion.initial}
          animate={{
            ...animatedListItemMotion.animate,
            transition: {
              ...animatedListTransition,
              ...(staggerDelay > 0 ? { delay: initialDelay + staggerDelay * index } : {}),
            },
          }}
          exit={{
            ...animatedListItemMotion.exit,
            transition: animatedListTransition,
          }}
        >
          {renderItem(item)}
        </MotionItem>
      ))}
    </AnimatePresence>
  )
}

type TAnimatedListProps<T> = TAnimatedListPresenceProps<T> & {
  as?: 'div' | 'ul' | 'ol'
  itemAs?: 'div' | 'li'
} & Omit<HTMLAttributes<HTMLElement>, 'children'>

export const AnimatedList = <T,>({
  items,
  getKey,
  renderItem,
  getItemDomId,
  as = 'div',
  itemAs: itemAsProp,
  className,
  itemClassName,
  initialDelay,
  staggerDelay,
  initialEnter,
  ...rest
}: TAnimatedListProps<T>) => {
  const Container = as
  const itemAs = itemAsProp ?? (as === 'ul' || as === 'ol' ? 'li' : 'div')

  return (
    <Container className={className} {...rest}>
      <AnimatedListPresence
        items={items}
        getKey={getKey}
        renderItem={renderItem}
        getItemDomId={getItemDomId}
        itemAs={itemAs}
        itemClassName={itemClassName}
        initialDelay={initialDelay}
        staggerDelay={staggerDelay}
        initialEnter={initialEnter}
      />
    </Container>
  )
}
