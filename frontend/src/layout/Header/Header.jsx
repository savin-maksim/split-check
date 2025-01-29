import { useApp } from '../../context/AppContext'
import { LogOut } from 'lucide-react'
import './header.scss'

function Header() {
  const { user, logout } = useApp()

  return (
    <header className="header">
      <div className="header__container container">
        <h1 className="header__logo">
          Split Check
        </h1>
        {user && (
          <div className="header__user">
            <span className="header__user-name">{user.name}</span>
            <button 
              className="header__logout" 
              onClick={logout}
              title="Выйти"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 