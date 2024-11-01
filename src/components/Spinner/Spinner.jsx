import './spinner.scss'

function Spinner({ className }) {
  return (
    <div className={`spinner ${className || ''}`}>
      <div className="spinner__circle"></div>
    </div>
  )
}

export default Spinner 