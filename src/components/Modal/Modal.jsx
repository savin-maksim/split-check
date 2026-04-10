import { useLayoutEffect, useRef } from 'react'
import './modal.scss'

const focusFirstField = (dialog) => {
  const root = dialog?.querySelector('.modal__content')
  if (!root) return
  const fromAttr = root.querySelector('[autofocus]') || root.querySelector('input[autofocus]')
  const firstInteractive = root.querySelector(
    'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled])',
  )
  const target = fromAttr ?? firstInteractive
  target?.focus({ preventScroll: false })
}

function Modal({ isOpen, onClose, children }) {
  const dialogRef = useRef(null)

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
      dialog.close()
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClick = (e) => {
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
    <dialog ref={dialogRef} className="modal" onClick={handleClick}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </dialog>
  )
}

export default Modal
