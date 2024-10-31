import React from 'react';
import './button.scss';

function ActionButton({ children, onClick, className, icon }) {
   return (
      <button
         type={'button'}
         onClick={onClick}
         className={`button ${className}`}
      >
         {icon && <span className="button--icon-left">{icon}</span>}
         {children}
      </button>
   );
}

export default ActionButton; 