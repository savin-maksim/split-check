import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'

import { cn } from '@shared/lib'

import './marquee-title.scss'

type TMarqueeTitleProps = {
  as?: ElementType
  className?: string
  textClassName?: string
  style?: CSSProperties
  children: ReactNode
}

export const MarqueeTitle = ({
  as: Tag = 'div',
  className,
  textClassName,
  style,
  children,
  ...rest
}: TMarqueeTitleProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLElement>(null)
  const [running, setRunning] = useState(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    const update = () => {
      setRunning(inner.scrollWidth - container.clientWidth > 1)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(container)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [children])

  return (
    <div ref={containerRef} className={cn('marquee-title', className)} style={style}>
      <Tag
        ref={innerRef}
        className={cn('marquee-title__text', textClassName, running && 'marquee-title__text--running')}
        {...rest}
      >
        {children}
      </Tag>
    </div>
  )
}
