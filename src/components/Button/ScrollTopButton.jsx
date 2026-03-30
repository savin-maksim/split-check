import { ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import './scroll-top-button.scss'

function ScrollTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!showScrollTop) return null

  return (
    <button className="scroll-top-button" onClick={scrollToTop} title="Наверх">
      <ArrowUp size={24} />
    </button>
  )
}

export default ScrollTopButton
