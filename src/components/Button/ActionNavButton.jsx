import { useLocation } from 'react-router-dom'
import { UserPlus, Plus, Share2, FilePlus } from 'lucide-react'
import './action-nav-button.scss'

function ActionNavButton({ onPeopleAction, onCostAction, onShareAction, onNewCheckAction }) {
  const location = useLocation()

  const getButtonConfig = () => {
    switch (location.pathname) {
      case '/':
        return onNewCheckAction
          ? {
              icon: <FilePlus size={24} />,
              onClick: onNewCheckAction,
              title: 'Новый чек',
            }
          : null
      case '/people':
        return {
          icon: <UserPlus size={24} />,
          onClick: onPeopleAction,
          title: 'Добавить людей',
        }
      case '/costs':
        return {
          icon: <Plus size={24} />,
          onClick: onCostAction,
          title: 'Добавить расход',
        }
      case '/stats':
        return {
          icon: <Share2 size={24} />,
          onClick: onShareAction,
          title: 'Поделиться',
        }
      default:
        return null
    }
  }

  const config = getButtonConfig()
  if (!config) return null

  return (
    <button className="action-nav-button" onClick={config.onClick} title={config.title}>
      {config.icon}
    </button>
  )
}

export default ActionNavButton
