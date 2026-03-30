import { Share2 } from 'lucide-react'
import IconButton from './IconButton'
import { toast } from 'react-hot-toast'

function ShareButton({ costs, people }) {
  const handleShare = async () => {
    try {
      const currentURL = window.location.href

      await navigator.share({
        url: currentURL,
      })
    } catch (error) {
      console.error('Error sharing:', error)

      // Don't show error for user cancellation
      if (error.name !== 'AbortError') {
        toast.error('Не удалось поделиться ссылкой')
      }
    }
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
