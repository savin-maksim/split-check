import { X } from 'lucide-react'

import { Button, EButtonVariant, Modal } from '@/shared/ui'

import { GeminiText } from '../gemini-text/gemini-text'

import './loading-modal.scss'

type TLoadingModalProps = {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
}

export const LoadingModal = ({ isOpen, onClose, onCancel }: TLoadingModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} mode="middle">
    <div className="f-receipt-scan-loading">
      <p className="f-receipt-scan-loading__title h3">Анализируем чек</p>

      <GeminiText className="text-center" aria-live="polite">
        Gemini обрабатывает чек
      </GeminiText>

      <p className="f-receipt-scan-loading__text">
        Вы можете закрыть это окно нажатием на пустое пространство, а мы продолжим анализ
      </p>

      <div className="f-receipt-scan-loading__actions">
        <Button
          type="button"
          variant={EButtonVariant.Danger}
          icon={<X aria-hidden="true" className="f-receipt-scan-loading__icon" size={'var(--button-icon-size)'} />}
          onClick={onCancel}
          aria-label="Отменить распознавание чека"
        >
          Отменить
        </Button>
      </div>
    </div>
  </Modal>
)
