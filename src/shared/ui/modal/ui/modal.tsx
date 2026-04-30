import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { MouseEvent, ReactNode, SyntheticEvent } from 'react'

import './modal.scss'
import { cn } from '@/shared/lib'

type TModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  mode?: 'top-100' | 'top-0'
}

type TScrollLockSnapshot = {
  scrollY: number
  htmlOverflow: string
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyWidth: string
  bodyOverscroll: string
}

let scrollLockDepth = 0
let scrollLockSnapshot: TScrollLockSnapshot | null = null

const lockPageScroll = () => {
  if (scrollLockDepth === 0) {
    scrollLockSnapshot = {
      scrollY: window.scrollY,
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
      bodyOverscroll: document.body.style.overscrollBehavior,
    }
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollLockSnapshot.scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overscrollBehavior = 'none'
  }
  scrollLockDepth++
}

const unlockPageScroll = () => {
  if (scrollLockDepth === 0) return
  scrollLockDepth--
  if (scrollLockDepth === 0 && scrollLockSnapshot) {
    const snap = scrollLockSnapshot
    scrollLockSnapshot = null
    document.documentElement.style.overflow = snap.htmlOverflow
    document.body.style.overflow = snap.bodyOverflow
    document.body.style.position = snap.bodyPosition
    document.body.style.top = snap.bodyTop
    document.body.style.width = snap.bodyWidth
    document.body.style.overscrollBehavior = snap.bodyOverscroll
    window.scrollTo(0, snap.scrollY)
  }
}

const focusFirstField = (dialog: HTMLDialogElement) => {
  const root = dialog.querySelector('.modal__content')
  if (!root) return
  const fromAttr = root.querySelector('[autofocus]') as HTMLElement | null
  const firstInteractive = root.querySelector(
    'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled])',
  ) as HTMLElement | null
  const target = fromAttr ?? firstInteractive
  target?.focus({ preventScroll: false })
}

const fadeTransition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }

/** Панель: выезд снизу вверх и уход обратно вниз при закрытии */
const sheetTransition = { duration: 0.35, ease: [0.32, 0.72, 0, 1] as const }

const sheetMotion = {
  initial: { y: '-50%' },
  animate: { y: '0' },
  exit: { y: '-50%' },
  transition: sheetTransition,
}

export const Modal = ({ isOpen, onClose, mode = 'top-100', children }: TModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isOpenRef = useRef(isOpen)
  isOpenRef.current = isOpen

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
      lockPageScroll()
      focusFirstField(dialog)
      queueMicrotask(() => focusFirstField(dialog))
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    return () => {
      unlockPageScroll()
      dialog?.close()
    }
  }, [])

  const handleExitComplete = () => {
    if (isOpenRef.current) return
    const dialog = dialogRef.current
    if (dialog?.open) {
      dialog.close()
    }
    unlockPageScroll()
  }

  const handleCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault()
    onClose()
  }

  return (
    <dialog ref={dialogRef} className="modal" onCancel={handleCancel} role="dialog" aria-modal="true">
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isOpen ? (
          <motion.div
            key="modal-layer"
            className="modal__layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
          >
            <div className="modal__backdrop" role="presentation" onClick={onClose} />
            <div
              className={cn(
                'modal__center',
                mode === 'top-100' && 'modal__center--top-100',
                mode === 'top-0' && 'modal__center--top-0',
              )}
            >
              <motion.div
                className="modal__sheet"
                {...sheetMotion}
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              >
                <div className="modal__content">{children}</div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  )
}
