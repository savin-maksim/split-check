import { useLocation } from 'react-router-dom'
import { UserPlus, Plus, Share2 } from 'lucide-react'
import './action-nav-button.scss'

function ActionNavButton({ onPeopleAction, onCostAction, onShareAction, onAddCheck, isChecksPage }) {
  const location = useLocation()
  
  const getButtonConfig = () => {
    const pathname = location.pathname

    // Если мы на странице чеков
    if (isChecksPage) {
      return {
        icon: <Plus size={24} />,
        onClick: onAddCheck,
        title: 'Добавить чек'
      }
    }

    // Проверяем, что мы находимся на странице конкретного чека
    const checkMatch = pathname.match(/\/checks\/([^\/]+)/)
    if (!checkMatch) return null

    // Определяем тип страницы
    if (pathname.endsWith('/people')) {
      return {
        icon: <UserPlus size={24} />,
        onClick: onPeopleAction,
        title: 'Добавить людей'
      }
    }
    
    if (pathname.endsWith('/costs')) {
      return {
        icon: <Plus size={24} />,
        onClick: onCostAction,
        title: 'Добавить расход'
      }
    }
    
    if (pathname.endsWith('/stats')) {
      return {
        icon: <Share2 size={24} />,
        onClick: onShareAction,
        title: 'Поделиться'
      }
    }

    return null
  }

  const config = getButtonConfig()
  if (!config) return null

  return (
    <button 
      className="action-nav-button" 
      onClick={config.onClick}
      title={config.title}
    >
      {config.icon}
    </button>
  )
}

export default ActionNavButton 