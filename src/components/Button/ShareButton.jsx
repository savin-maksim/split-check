import { Share2 } from 'lucide-react'
import IconButton from './IconButton'
import { useApp } from '../../context/AppContext'

function ShareButton() {
  const { setStatisticsShareModalOpen } = useApp()

  const handleShare = () => {
    setStatisticsShareModalOpen(true)
  }

  return (
    <div className="share-button">
      <IconButton onClick={handleShare} icon={<Share2 size={24} />} className="share-button__icon">
        Поделиться
      </IconButton>
    </div>
  )
}

export default ShareButton
