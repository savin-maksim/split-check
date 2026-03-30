import React from 'react'
import './icon-button.scss'

function IconButton({ onClick, className, icon, ariaLabel, title, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`icon-button ${className ?? ''}`}
      title={title}
      aria-label={ariaLabel}
      {...rest}
    >
      {icon}
    </button>
  )
}

export default IconButton
