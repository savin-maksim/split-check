import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { MouseEvent, ReactNode, SyntheticEvent } from 'react'

import './modal.scss'
import {
  cn,
  lockScroll,
  modalOverlayFadeTransition,
  modalSheetMotionFromTop,
  modalSheetMotionFromBottom,
  unlockScroll,
} from '@/shared/lib'

type TModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  mode?: 'top-100' | 'top-0' | 'middle' | 'bottom-0'
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

const getModalSheetMotion = (mode: TModalProps['mode']) => {
  switch (mode) {
    case 'top-100':
      return modalSheetMotionFromTop
    case 'top-0':
      return modalSheetMotionFromTop
    case 'middle':
      return modalSheetMotionFromBottom
    case 'bottom-0':
      return modalSheetMotionFromBottom
    default:
      return modalSheetMotionFromTop
  }
}
export const Modal = ({ isOpen, onClose, mode = 'top-100', children }: TModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isOpenRef = useRef(isOpen)
  isOpenRef.current = isOpen

  const classMode = cn(
    mode === 'top-100' && 'modal__center--top-100',
    mode === 'top-0' && 'modal__center--top-0',
    mode === 'middle' && 'modal__center--middle',
    mode === 'bottom-0' && 'modal__center--bottom-0',
  )

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
      focusFirstField(dialog)
      queueMicrotask(() => focusFirstField(dialog))
      lockScroll()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    return () => {
      dialog?.close()
      unlockScroll()
    }
  }, [])

  const handleExitComplete = () => {
    if (isOpenRef.current) return
    const dialog = dialogRef.current
    if (dialog?.open) {
      dialog.close()
    }
    unlockScroll()
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
            transition={modalOverlayFadeTransition}
          >
            <div className="modal__backdrop" role="presentation" onClick={onClose} />
            <div className={cn(classMode, 'modal__center')}>
              <motion.div
                className="modal__sheet"
                {...getModalSheetMotion(mode)}
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  )
}
