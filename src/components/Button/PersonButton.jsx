import React from 'react'
import './button.scss'

function PersonButton({ children, onClick, className, icon, ...rest }) {
  return (
    <button type="button" onClick={onClick} className={`button button__person ${className ?? ''}`} {...rest}>
      <span className="button__person-text">{children}</span>
      {icon && <span className="button--icon-right">{icon}</span>}
    </button>
  )
}

export default PersonButton
