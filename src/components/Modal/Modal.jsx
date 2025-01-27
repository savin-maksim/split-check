import { useEffect, useRef, useState } from 'react'
import './modal.scss'

function Modal({ isOpen, onClose, children }) {
  const dialogRef = useRef(null)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

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

  const handleFocus = () => {
    // Проверяем, что это мобильное устройство
    if (window.innerWidth <= 768) {
      setIsKeyboardVisible(true)
    }
  }

  const handleBlur = () => {
    setIsKeyboardVisible(false)
  }

  return (
    <dialog 
      ref={dialogRef}
      className={`modal ${isKeyboardVisible ? 'keyboard-visible' : ''}`}
      onClick={handleClick}
    >
      <div 
        className="modal__content" 
        onClick={e => e.stopPropagation()}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
      </div>
    </dialog>
  )
}

export default Modal 