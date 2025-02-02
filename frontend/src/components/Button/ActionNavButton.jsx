import { useLocation } from 'react-router-dom'
import { UserPlus, Plus, Share2 } from 'lucide-react'
import { shareService } from '../../api/share.service'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'
import './action-nav-button.scss'

function ActionNavButton({ onPeopleAction, onCostAction, onAddCheck, isChecksPage }) {
  const location = useLocation()
  
  const handleShare = async () => {
    try {
      const checkId = location.pathname.split('/')[2]
      
      // Сохраняем предыдущую ссылку в localStorage
      const prevShareUrl = localStorage.getItem(`shareUrl_${checkId}`)
      
      const response = await shareService.createShareLink(checkId, 'readonly')
      const shareUrl = `${window.location.origin}/share/${response.token}`
      
      await navigator.clipboard.writeText(shareUrl)
      
      // Если ссылка уже существовала и она та же самая
      if (prevShareUrl === shareUrl) {
        toast.success('Существующая ссылка скопирована в буфер обмена')
      } else {
        // Сохраняем новую ссылку
        localStorage.setItem(`shareUrl_${checkId}`, shareUrl)
        toast.success('Ссылка скопирована в буфер обмена')
      }
    } catch (err) {
      toast.error('Не удалось создать ссылку')
    }
  }

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
        onClick: handleShare,
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