import { useLayoutEffect, useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'

import './modal.scss'

type TModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
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

export const Modal = ({ isOpen, onClose, children }: TModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
      document.body.style.overflow = 'hidden'
      focusFirstField(dialog)
      queueMicrotask(() => focusFirstField(dialog))
    } else {
      if (dialog.open) dialog.close()
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    const dialogDimensions = e.currentTarget.getBoundingClientRect()
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      onClose()
    }
  }

  return (
    <dialog ref={dialogRef} className="modal" onClick={handleClick} role="dialog" aria-modal="true">
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </dialog>
  )
}
