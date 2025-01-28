import { NavLink, useLocation } from 'react-router-dom'
import { Receipt, Users, Calculator, BarChart3 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ActionNavButton from '../Button/ActionNavButton'
import './navigation.scss'

function Navigation() {
  const location = useLocation()
  const { setIsModalOpen } = useApp()

  // Извлекаем checkId из текущего URL
  const checkId = location.pathname.match(/\/checks\/([^\/]+)/)?.[1]

  const handlePeopleAction = () => {
    setIsModalOpen('addPerson')
  }

  const handleCostAction = () => {
    setIsModalOpen('addCost')
  }

  const handleShareAction = () => {
    setIsModalOpen('share')
  }

  const handleAddCheck = () => {
    setIsModalOpen('addCheck')
  }

  const isChecksPage = location.pathname === '/checks'

  return (
    <nav className="navigation">
      <NavLink 
        to="/checks" 
        className={({ isActive }) => isActive && location.pathname === '/checks' ? 'active' : ''}
      >
        <Receipt size={24} />
      </NavLink>
      
      <NavLink 
        to={checkId ? `/checks/${checkId}/people` : '#'} 
        className={({ isActive }) => `${isActive ? 'active' : ''} ${!checkId ? 'disabled' : ''}`}
      >
        <Users size={24} />
      </NavLink>

      <ActionNavButton 
        onPeopleAction={handlePeopleAction}
        onCostAction={handleCostAction}
        onShareAction={handleShareAction}
        onAddCheck={handleAddCheck}
        isChecksPage={isChecksPage}
      />

      <NavLink 
        to={checkId ? `/checks/${checkId}/costs` : '#'} 
        className={({ isActive }) => `${isActive ? 'active' : ''} ${!checkId ? 'disabled' : ''}`}
      >
        <Calculator size={24} />
      </NavLink>
      
      <NavLink 
        to={checkId ? `/checks/${checkId}/stats` : '#'} 
        className={({ isActive }) => `${isActive ? 'active' : ''} ${!checkId ? 'disabled' : ''}`}
      >
        <BarChart3 size={24} />
      </NavLink>
    </nav>
  )
}

export default Navigation 