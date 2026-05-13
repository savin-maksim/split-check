import { AnimatePresence, motion } from 'framer-motion'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { animatedBlockMotion, animatedBlockTransition, cn } from '@shared/lib'
import type { TAnimatedBlockMotionPreset } from '@shared/types'

import './animated-block.scss'

type TAnimatedBlockShared = {
  children: ReactNode
  initialDelay?: number
  initialEnter?: boolean
  blockMotion?: TAnimatedBlockMotionPreset
} & Omit<ComponentPropsWithoutRef<typeof motion.div>, 'children' | 'initial' | 'animate' | 'exit'>

type TAnimatedBlockWithPresence = TAnimatedBlockShared & {
  isPresent: boolean
  presenceKey: string
}

type TAnimatedBlockWithoutPresence = TAnimatedBlockShared & {
  isPresent?: undefined
  presenceKey?: undefined
}

export type TAnimatedBlockProps = TAnimatedBlockWithPresence | TAnimatedBlockWithoutPresence

export const AnimatedBlock = ({
  children,
  className,
  initialDelay = 0,
  initialEnter = true,
  layout = true,
  blockMotion: blockMotionPreset = animatedBlockMotion,
  isPresent,
  presenceKey,
  ...motionDivProps
}: TAnimatedBlockProps) => {
  const blockClassName = cn('animated-block', className)

  const motionProps = {
    ...motionDivProps,
    layout,
    className: blockClassName,
    initial: initialEnter ? blockMotionPreset.initial : false,
    animate: {
      ...blockMotionPreset.animate,
      transition: {
        ...animatedBlockTransition,
        ...(initialDelay > 0 ? { delay: initialDelay } : {}),
      },
    },
    exit: {
      ...blockMotionPreset.exit,
      transition: animatedBlockTransition,
    },
    children,
  }

  if (isPresent === undefined) {
    return <motion.div {...motionProps} />
  }

  return <AnimatePresence>{isPresent ? <motion.div key={presenceKey} {...motionProps} /> : null}</AnimatePresence>
}
