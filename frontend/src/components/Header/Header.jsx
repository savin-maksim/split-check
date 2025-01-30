import React, { useState } from 'react'
import { User, Users, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import IconButton from '../Button/IconButton'
import './header.scss'

function Header() {
  const navigate = useNavigate()
  const { user, setIsModalOpen, logout } = useApp()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header__content">
        <h1 className='header__title'>SplitCheck</h1>

        {/* <IconButton
            icon={<Users size={24} />}
            onClick={() => setIsModalOpen('manageGroups')}
            title="Управление группами"
            className="header"
          /> */}

        <button
          className="header__user-button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          <User size={24} />
          <span>{user?.name || user?.email}</span>
        </button>

        {isUserMenuOpen && (
          <div className="header__user-menu">
            <button onClick={handleLogout} className="header__menu-item">
              <LogOut size={16} />
              <span>Выйти</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 