import { useState, useEffect } from 'react'

import { ArrowUp } from 'lucide-react'

import './scroll-top-button.scss'

export const ScrollTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <button className="scroll-top-button" onClick={handleClick} title="Наверх" aria-label="Прокрутить наверх">
      <ArrowUp size={24} aria-hidden="true" />
    </button>
  )
}
