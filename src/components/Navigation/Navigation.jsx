import { NavLink } from 'react-router-dom'
import { Receipt, Users, Calculator, BarChart3 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ActionNavButton from '../Button/ActionNavButton'
import './navigation.scss'

function Navigation() {
  const { setIsModalOpen, triggerNewCheckModal, setStatisticsShareModalOpen } = useApp()

  const handlePeopleAction = () => {
    setIsModalOpen('addPerson')
  }

  const handleCostAction = () => {
    setIsModalOpen('addCost')
  }

  const handleShareAction = () => {
    setStatisticsShareModalOpen(true)
  }

  return (
    <nav className="navigation">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
        <Receipt size={24} />
      </NavLink>
      <NavLink to="/people" className={({ isActive }) => (isActive ? 'active' : '')}>
        <Users size={24} />
      </NavLink>

      <ActionNavButton
        onPeopleAction={handlePeopleAction}
        onCostAction={handleCostAction}
        onShareAction={handleShareAction}
        onNewCheckAction={triggerNewCheckModal}
      />

      <NavLink to="/costs" className={({ isActive }) => (isActive ? 'active' : '')}>
        <Calculator size={24} />
      </NavLink>

      <NavLink to="/stats" className={({ isActive }) => (isActive ? 'active' : '')}>
        <BarChart3 size={24} />
      </NavLink>
    </nav>
  )
}

export default Navigation
