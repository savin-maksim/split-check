import './icon-button.scss'

const variantClass = {
  danger: 'icon-button--danger',
  active: 'icon-button--active',
  wide: 'icon-button--wide',
}

function IconButton({ onClick, className, icon, ariaLabel, title, variant, ...rest }) {
  const variantModifier = variant != null ? variantClass[variant] : null
  return (
    <button
      type="button"
      onClick={onClick}
      className={['icon-button', variantModifier, className].filter(Boolean).join(' ')}
      title={title}
      aria-label={ariaLabel}
      {...rest}
    >
      {icon}
    </button>
  )
}

export default IconButton
