import { Camera, Image } from 'lucide-react'

import { Modal, Button } from '@/shared/ui'

import type { TReceiptSource } from '../../model'

import './receipt-source-modal.scss'

type TReceiptSourceModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (source: TReceiptSource) => void
}

export const ReceiptSourceModal = ({ isOpen, onClose, onSelect }: TReceiptSourceModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} mode="middle">
    <h3 className="modal__title">Загрузить чек</h3>
    <div className="receipt-source-modal__options">
      <Button onClick={() => onSelect('camera')} icon={<Camera aria-hidden="true" />}>
        Камера
      </Button>
      <Button onClick={() => onSelect('gallery')} icon={<Image aria-hidden="true" />}>
        Галерея
      </Button>
    </div>
  </Modal>
)
