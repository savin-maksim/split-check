import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import './checks-page.scss'

function ChecksPage() {
  return (
    <div className="checks-page">
      <div className="checks-page__message">
        <Users size={48} />
        <h2>Добро пожаловать в SplitCheck!</h2>
        <p>Для начала работы перейдите на <Link to="/people">страницу участников</Link> и добавьте людей, между которыми нужно разделить расходы.</p>
      </div>
    </div>
  )
}

export default ChecksPage 