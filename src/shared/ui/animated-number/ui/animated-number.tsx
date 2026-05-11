import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'

type TAnimatedNumberProps = {
  value: number
  format?: (value: number) => string
  className?: string
  duration?: number
  initialEnter?: boolean
  entranceFrom?: number
  delay?: number
}

const defaultFormat = (n: number) => String(Math.round(n))

export const AnimatedNumber = ({
  value,
  format = defaultFormat,
  className,
  duration = 0.7,
  initialEnter = true,
  entranceFrom = 0,
  delay = 0,
}: TAnimatedNumberProps) => {
  const reduceMotion = useReducedMotion()
  const prefersReduced = reduceMotion === true
  const shouldEntrance = initialEnter && !prefersReduced
  const mv = useMotionValue(shouldEntrance ? entranceFrom : value)
  const text = useTransform(mv, (v) => format(v))

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: prefersReduced ? 0 : duration,
      ease: [0.4, 0, 0.2, 1],
      delay: delay,
    })
    return () => controls.stop()
  }, [duration, mv, prefersReduced, value])

  return <motion.span className={className}>{text}</motion.span>
}
