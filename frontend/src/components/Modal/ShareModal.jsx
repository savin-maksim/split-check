import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Copy, Check } from 'lucide-react'
import Modal from './Modal'
import ActionButton from '../Button/ActionButton'
import toast from 'react-hot-toast'
import './share-modal.scss'

function ShareModal({ isOpen, onClose, shareUrl }) {
  const [isCopied, setIsCopied] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setIsCopied(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (shareUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 256,
        margin: 0,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error)
          toast.error('Не удалось сгенерировать QR-код')
        }
      })
    }
  }, [shareUrl])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      toast.success('Ссылка скопирована в буфер обмена')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast.error('Не удалось скопировать ссылку')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Поделиться чеком"
      className="share-modal"
    >
      <div className="share-modal__content">
        <div className="share-modal__qr">
          <canvas ref={canvasRef} />
        </div>

        <div className="share-modal__link">
          <ActionButton
            onClick={handleCopyLink}
            icon={isCopied ? <Check size={20} /> : <Copy size={20} />}
            className={`share-modal__copy-button ${isCopied ? 'copied' : ''}`}
          >
            {isCopied ? 'Скопировано' : 'Копировать ссылку'}
          </ActionButton>
        </div>
      </div>
    </Modal>
  )
}

export default ShareModal