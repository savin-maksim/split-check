const getScrollbarWidth = (): number => window.innerWidth - document.documentElement.clientWidth

export const lockScroll = (): void => {
  const scrollbarWidth = getScrollbarWidth()
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
  document.body.classList.add('scroll-locked')
}

export const unlockScroll = (): void => {
  document.body.classList.remove('scroll-locked')
  document.body.style.paddingRight = ''
}
