import './button.scss'

const variantClass = {
  danger: 'button--danger',
  active: 'button--active',
  wide: 'button--wide',
  full: 'button--full',
}

function Button({ onClick, disabled = false, className, icon, children, title, type = 'button', variant, ...rest }) {
  const variantModifier = variant != null ? variantClass[variant] : null

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={['button', variantModifier, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {icon != null && icon !== false && (
        <span className="button__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="button__label">{children}</span>
    </button>
  )
}

export default Button
