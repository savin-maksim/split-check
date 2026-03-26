import React from 'react';
import './button.scss';

function IconButton({ onClick, className, icon, ariaLabel, ...rest }) {
   return (
      <button
         type="button"
         onClick={onClick}
         className={`button button--icon ${className ?? ''}`}
         aria-label={ariaLabel}
         {...rest}
      >
         {icon}
      </button>
   );
}

export default IconButton; 