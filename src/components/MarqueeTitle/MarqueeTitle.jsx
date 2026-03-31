import { useLayoutEffect, useRef, useState } from 'react'
import './marquee-title.scss'

function MarqueeTitle({
  as: Tag = 'div',
  className,
  textClassName,
  style,
  children,
  ...rest
}) {
  const containerRef = useRef(null)
  const innerRef = useRef(null)
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
    <div
      ref={containerRef}
      className={['marquee-title', className].filter(Boolean).join(' ')}
      style={style}
    >
      <Tag
        ref={innerRef}
        className={['marquee-title__text', textClassName, running && 'marquee-title__text--running']
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </Tag>
    </div>
  )
}

export default MarqueeTitle
