import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './modal.scss'

function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="modal" onClick={onClose}>
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal 