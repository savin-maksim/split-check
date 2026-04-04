import './card-stats.scss'
import PropTypes from 'prop-types'

export default function CardStats({ icon, value, label, className, ...rest }) {
  return (
    <span className={['card-stats', className].filter(Boolean).join(' ')} {...rest}>
      {icon}
      {value} {label}
    </span>
  )
}

CardStats.propTypes = {
  icon: PropTypes.element.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
}
