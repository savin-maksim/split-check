import React from 'react'
import ActionButton from '../Button/ActionButton'
import './modal.scss'

function AddPersonModal({ isOpen, onClose, onSubmit, title, children }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal">
      <div className="modal__content">
        <h2 className=''>{title}</h2>
        <div onKeyDown={handleKeyDown}>
          {children}
        </div>
        <div className="modal__buttons">
          <ActionButton onClick={onSubmit}>
            Добавить
          </ActionButton>
          <ActionButton onClick={onClose}>
            Отмена
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

export default AddPersonModal 