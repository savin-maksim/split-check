import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { MouseEvent, ReactNode, SyntheticEvent } from 'react'

import './modal.scss'
import {
  cn,
  lockScroll,
  modalOverlayFadeTransition,
  modalSheetMotion,
  unlockScroll,
} from '@/shared/lib'

type TModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  mode?: 'top-100' | 'top-0'
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
            <div
              className={cn(
                'modal__center',
                mode === 'top-100' && 'modal__center--top-100',
                mode === 'top-0' && 'modal__center--top-0',
              )}
            >
              <motion.div
                className="modal__sheet"
                {...modalSheetMotion}
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
