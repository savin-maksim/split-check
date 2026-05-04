import type { RefObject } from 'react'
import { useState, useEffect } from 'react'

import { ArrowUp } from 'lucide-react'

import { animatedBlockMotionPop } from '@/shared/lib'

import { AnimatedBlock } from '../../animated-block'

import './scroll-top-button.scss'

export type TScrollTopButtonProps = {
  /** Корневой прокручиваемый контейнер (если скролл не на `window`) */
  scrollRootRef?: RefObject<HTMLElement | null>
}

export const ScrollTopButton = ({ scrollRootRef }: TScrollTopButtonProps = {}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const scrollRoot = scrollRootRef?.current ?? null

    const getScrollY = () => {
      if (scrollRoot) return scrollRoot.scrollTop
      return window.scrollY
    }

    const handleScroll = () => {
      setIsVisible(getScrollY() > 200)
    }

    if (scrollRoot) {
      scrollRoot.addEventListener('scroll', handleScroll, { passive: true })
    } else {
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollRoot) {
        scrollRoot.removeEventListener('scroll', handleScroll)
      } else {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [scrollRootRef])

  const handleClick = () => {
    const el = scrollRootRef?.current
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatedBlock
      isPresent={isVisible}
      presenceKey="scroll-top"
      layout={false}
      className="scroll-top-button__host"
      blockMotion={animatedBlockMotionPop}
    >
      <button
        type="button"
        className="scroll-top-button__btn"
        onClick={handleClick}
        title="Наверх"
        aria-label="Прокрутить наверх"
      >
        <ArrowUp className="scroll-top-button__icon" size={'var(--button-icon-size)'} aria-hidden="true" />
      </button>
    </AnimatedBlock>
  )
}
