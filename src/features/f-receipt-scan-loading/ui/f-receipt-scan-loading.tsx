import { Modal } from '@/shared/ui'

import './f-receipt-scan-loading.scss'

type TFReceiptScanLoadingProps = {
  isOpen: boolean
}

const noop = () => undefined

export const FReceiptScanLoading = ({ isOpen }: TFReceiptScanLoadingProps) => (
  <Modal isOpen={isOpen} onClose={noop}>
    <div className="f-receipt-scan-loading">
      <p className="f-receipt-scan-loading__text h3">
        Анализируем чек через <span className="f-receipt-scan-loading__gemini-text">Gemini</span>
      </p>
      <p className="f-receipt-scan-loading__hint">Обычно это занимает около 20 секунд</p>
    </div>
  </Modal>
)
