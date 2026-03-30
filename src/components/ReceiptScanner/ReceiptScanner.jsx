import React, { useState, useRef } from 'react'
import { ScanLine, Camera, Image } from 'lucide-react'
import IconButton from '../Button/IconButton'
import { analyzeReceipt } from '../../services/ai'
import ItemsPreviewModal from './ItemsPreviewModal'
import { toast } from 'react-hot-toast'
import Modal from '../Modal/Modal'
import './scanner.scss'

const ReceiptScanner = ({ onAddCosts, people, paymentMode, singlePayer }) => {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [parsedItems, setParsedItems] = useState([])

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleScanClick = () => {
    // Check if key is configured (optional, since service handles it, but good for UX)
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      toast.error('API ключ не настроен. См. инструкцию в README.')
      return
    }
    setIsSourceModalOpen(true)
  }

  const handleSourceSelect = (source) => {
    setIsSourceModalOpen(false)
    setTimeout(() => {
      if (source === 'camera') {
        cameraInputRef.current?.click()
      } else {
        fileInputRef.current?.click()
      }
    }, 100)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const items = await analyzeReceipt(file)
      setParsedItems(items)
      setIsPreviewModalOpen(true)
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Ошибка при сканировании')
    } finally {
      setIsLoading(false)
      // Reset input value so same file can be selected again
      e.target.value = ''
    }
  }

  const handleConfirmItems = (items) => {
    // Determine payer based on mode
    let initialPaidBy = []
    if (paymentMode === 'single' && singlePayer) {
      initialPaidBy = [singlePayer]
    }
    // For manual mode, leave empty for user to fill, or could imply "me" if we had that concept.
    // Leaving empty is safer.

    const newCosts = items.map((item, index) => ({
      id: Date.now() + index,
      title: item.title,
      amount: item.pricePerUnit * item.quantity,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      paidBy: initialPaidBy,
      splitBetween: [],
      distributionType: 'equal',
      weights: {},
    }))

    onAddCosts(newCosts)
    setIsPreviewModalOpen(false)
    setParsedItems([])
  }

  return (
    <>
      <IconButton
        icon={<ScanLine />}
        onClick={handleScanClick}
        ariaLabel="Сканировать чек"
        className="scanner-button"
      />

      {/* File input (Gallery) */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />

      {/* Camera input (Force Camera) */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* Source Selection Modal */}
      <Modal isOpen={isSourceModalOpen} onClose={() => setIsSourceModalOpen(false)}>
        <h2 className="modal__title">Загрузить чек</h2>
        <div className="scanner__source-options">
          <div className="scanner__source-btn" onClick={() => handleSourceSelect('camera')}>
            <Camera />
            <p>Камера</p>
          </div>
          <div className="scanner__source-btn" onClick={() => handleSourceSelect('gallery')}>
            <Image />
            <p>Галерея</p>
          </div>
        </div>
      </Modal>

      {/* Loading Modal */}
      {isLoading && (
        <Modal isOpen={true} onClose={() => {}}>
          <div className="scanner__loading">
            <div className="scanner__gemini-logo">
              <img src="/gemini_icon-logo.png" width="40px" alt="" />
            </div>
            <p className="scanner__loading-text">
              Анализируем чек с помощью <span className="gemini-text-span">Gemini...</span>
            </p>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      <ItemsPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        items={parsedItems}
        onConfirm={handleConfirmItems}
      />
    </>
  )
}

export default ReceiptScanner
