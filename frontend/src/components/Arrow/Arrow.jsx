import './arrow.scss'

function Arrow({ direction = 'down', className = '', title }) {
  return (
    <div className={`arrow ${className}`}>
      <div className={`arrow__body ${direction === 'up' ? 'arrow__body--up' : ''}`}>
        <span>{title}</span>
        <img src="/arrow.svg" alt="Стрелка" />
      </div>
    </div>
  )
}

export default Arrow 