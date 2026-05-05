import { X } from 'lucide-react'

import { Button, EButtonVariant, Modal } from '@/shared/ui'

import './f-receipt-scan-loading.scss'

type TFReceiptScanLoadingProps = {
  isOpen: boolean
  onClose: () => void
  phaseLabel: string | null
  onCancel: () => void
}

export const FReceiptScanLoading = ({ isOpen, onClose, phaseLabel, onCancel }: TFReceiptScanLoadingProps) => (
  <Modal isOpen={isOpen} onClose={onClose} mode="middle">
    <div className="f-receipt-scan-loading">
      <p className="f-receipt-scan-loading__title h3">Анализируем чек</p>

      {phaseLabel ? (
        <span className="gemini-gradient text-center" aria-live="polite">
          {phaseLabel}
        </span>
      ) : null}

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
