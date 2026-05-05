import './f-receipt-scan-loading-banner.scss'
import { Button } from '@/shared/ui'

type TFReceiptScanLoadingBannerProps = {
  isVisible: boolean
  onExpand: () => void
}

export const FReceiptScanLoadingBanner = ({ isVisible, onExpand }: TFReceiptScanLoadingBannerProps) => {
  if (!isVisible) return null

  return (
    <div className="f-receipt-scan-loading-banner" role="presentation">
      <Button
        title="Развернуть окно распознавания чека"
        aria-label="Развернуть окно распознавания чека"
        onClick={onExpand}
      >
        <span className="gemini-gradient">Gemini</span>
      </Button>
    </div>
  )
}
