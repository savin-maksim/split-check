import { AnimatePresence, motion } from 'framer-motion'
import type { HTMLAttributes, Key, ReactNode } from 'react'

import { animatedListLayoutTransition } from '../lib/animated-list-layout-transition'

import './animated-list-layout.scss'

const itemMotion = {
  initial: { opacity: 0, scale: 0.97, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -8 },
  transition: animatedListLayoutTransition,
}

type TAnimatedListPresenceProps<T> = {
  items: readonly T[]
  getKey: (item: T) => Key
  renderItem: (item: T) => ReactNode
  itemAs?: 'div' | 'li'
  itemClassName?: string
  /**
   * `true` — не проигрывать enter-анимацию у элементов, уже есть при первом рендере (как раньше с `initial={false}`).
   * По умолчанию `false`: после перезагрузки страницы элементы списка входят с анимацией.
   */
  suppressInitialEnter?: boolean
}

/** Только AnimatePresence + обёртки элементов — для вставки внутрь существующего `.list-layout` рядом с другими узлами */
export const AnimatedListPresence = <T,>({
  items,
  getKey,
  renderItem,
  itemAs = 'div',
  itemClassName,
  suppressInitialEnter = false,
}: TAnimatedListPresenceProps<T>) => {
  const MotionItem = itemAs === 'li' ? motion.li : motion.div
  const cellClass = itemClassName ?? 'animated-list-layout__item'

  return (
    <AnimatePresence mode="popLayout" initial={!suppressInitialEnter}>
      {items.map((item) => (
        <MotionItem key={getKey(item)} layout className={cellClass} {...itemMotion}>
          {renderItem(item)}
        </MotionItem>
      ))}
    </AnimatePresence>
  )
}

type TAnimatedListLayoutProps<T> = TAnimatedListPresenceProps<T> & {
  as?: 'div' | 'ul' | 'ol'
  /** По умолчанию `li` для `ul`/`ol`, иначе `div` */
  itemAs?: 'div' | 'li'
} & Omit<HTMLAttributes<HTMLElement>, 'children'>

/** Обёртка с классом `list-layout` (или своим) + анимированные элементы списка */
export const AnimatedListLayout = <T,>({
  items,
  getKey,
  renderItem,
  as = 'div',
  itemAs: itemAsProp,
  className,
  itemClassName,
  suppressInitialEnter,
  ...rest
}: TAnimatedListLayoutProps<T>) => {
  const Container = as
  const itemAs = itemAsProp ?? (as === 'ul' || as === 'ol' ? 'li' : 'div')

  return (
    <Container className={className} {...rest}>
      <AnimatedListPresence
        items={items}
        getKey={getKey}
        renderItem={renderItem}
        itemAs={itemAs}
        itemClassName={itemClassName}
        suppressInitialEnter={suppressInitialEnter}
      />
    </Container>
  )
}
