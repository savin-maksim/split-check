import React from 'react'
import './button-new.scss'

function Button({ onClick, disabled = false, className, icon, children, title, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={['button-new', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {icon != null && icon !== false && (
        <span className="button-new__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="button-new__label">{children}</span>
    </button>
  )
}

export default Button
