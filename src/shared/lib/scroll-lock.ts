const getScrollbarWidth = (): number => window.innerWidth - document.documentElement.clientWidth

let scrollLockCount = 0

export const lockScroll = (): void => {
  scrollLockCount += 1

  const scrollbarWidth = getScrollbarWidth()
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
  document.body.classList.add('scroll-locked')
}

export const unlockScroll = (): void => {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount > 0) return

  document.body.classList.remove('scroll-locked')
  document.body.style.paddingRight = ''
}
