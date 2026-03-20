import React from 'react';
import './button.scss';

function ActionButton({ children, onClick, className, icon, disabled }) {
   return (
      <button
         type={'button'}
         onClick={onClick}
         disabled={disabled}
         className={['button', className].filter(Boolean).join(' ')}
      >
         {icon && <span className="button--icon-left">{icon}</span>}
         {children}
      </button>
   );
}

export default ActionButton; 