import { useState } from 'react'
import { Link } from 'lucide-react'
import ActionButton from '../Button/ActionButton'
import Modal from './Modal'
import Spinner from '../Spinner/Spinner'
import { toast } from 'react-hot-toast'
import './modal.scss'

function ImportModal({ isOpen, onClose, onImportFromURL }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleImport = async () => {
    setIsLoading(true)
    const toastId = toast.loading('Импорт данных...')

    try {
      await onImportFromURL()
      toast.success('Данные успешно импортированы', { id: toastId })
      onClose()
    } catch (error) {
      toast.error('Ошибка при импорте данных', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">Импорт данных</h2>
      <div className="modal__import-buttons">
        <ActionButton
          icon={isLoading ? <Spinner /> : <Link size={20} />}
          onClick={handleImport}
          disabled={isLoading}
        >
          Импорт из ссылки
        </ActionButton>
      </div>
      <div className="modal__buttons">
        <ActionButton onClick={onClose}>
          Отмена
        </ActionButton>
      </div>
    </Modal>
  )
}

export default ImportModal