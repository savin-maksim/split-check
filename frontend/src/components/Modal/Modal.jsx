import React, { useEffect, useRef } from 'react';
import './modal.scss';

function Modal({ isOpen, onClose, children, className = '' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal__content">
        {children}
      </div>
    </dialog>
  );
}

export default Modal; 