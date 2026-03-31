import './button-new.scss'

const variantClass = {
  danger: 'button-new--danger',
  active: 'button-new--active',
}

function Button({ onClick, disabled = false, className, icon, children, title, type = 'button', variant, ...rest }) {
  const variantModifier = variant != null ? variantClass[variant] : null

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={['button-new', variantModifier, className].filter(Boolean).join(' ')}
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
