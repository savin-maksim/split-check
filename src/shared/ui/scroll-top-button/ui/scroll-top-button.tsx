import { useState, useEffect } from 'react'

import { ArrowUp } from 'lucide-react'

import { animatedBlockMotionPop } from '@/shared/lib'

import { AnimatedBlock } from '../../animated-block'

import './scroll-top-button.scss'

const SCROLL_THRESHOLD = 200

export const ScrollTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleClick = () => {
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
