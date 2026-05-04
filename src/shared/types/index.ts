import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

export type {
  TAnimatedBlockMotion,
  TAnimatedBlockMotionPop,
  TAnimatedBlockMotionPreset,
} from './motion-presets'

export type TPropsWithClassName = {
  className?: string
}

export type TPropsWithChildren = {
  children: ReactNode
}

export type TPolymorphicProps<T extends ElementType> = {
  as?: T
} & ComponentPropsWithoutRef<T>
