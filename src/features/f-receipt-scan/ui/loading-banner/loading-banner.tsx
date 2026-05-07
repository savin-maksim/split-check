import { Button } from '@/shared/ui'

import { GeminiText } from '../gemini-text/gemini-text'

import './loading-banner.scss'

type TLoadingBannerProps = {
  isVisible: boolean
  onExpand: () => void
}

export const LoadingBanner = ({ isVisible, onExpand }: TLoadingBannerProps) => {
  if (!isVisible) return null

  return (
    <div className="f-receipt-scan-loading-banner" role="presentation">
      <Button
        title="Развернуть окно распознавания чека"
        aria-label="Развернуть окно распознавания чека"
        onClick={onExpand}
      >
        <GeminiText>Gemini</GeminiText>
      </Button>
    </div>
  )
}
