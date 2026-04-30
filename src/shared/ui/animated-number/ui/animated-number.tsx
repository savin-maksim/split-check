import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'

type TAnimatedNumberProps = {
  value: number
  /** По умолчанию целое число как строка */
  format?: (value: number) => string
  className?: string
  /** Длительность перехода между числами, сек */
  duration?: number
  /** Входная анимация при первом монтировании (например после перезагрузки страницы) */
  animateEntrance?: boolean
  /** Стартовое значение при входе; по умолчанию `0` */
  entranceFrom?: number
}

const defaultFormat = (n: number) => String(Math.round(n))

export const AnimatedNumber = ({
  value,
  format = defaultFormat,
  className,
  duration = 0.25,
  animateEntrance = true,
  entranceFrom = 0,
}: TAnimatedNumberProps) => {
  const reduceMotion = useReducedMotion()
  const prefersReduced = reduceMotion === true
  const shouldEntrance = animateEntrance && !prefersReduced
  const mv = useMotionValue(shouldEntrance ? entranceFrom : value)
  const text = useTransform(mv, (v) => format(Math.round(v)))

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: prefersReduced ? 0 : duration,
      ease: [0.4, 0, 0.2, 1],
    })
    return () => controls.stop()
  }, [duration, mv, prefersReduced, value])

  return <motion.span className={className}>{text}</motion.span>
}
