import { useEffect, useRef } from 'react'
import './modal.scss'

function Modal({ isOpen, onClose, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen) {
      dialog?.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog?.close()
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
    <dialog 
      ref={dialogRef}
      className="modal"
      onClick={handleClick}
    >
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </dialog>
  )
}

export default Modal 