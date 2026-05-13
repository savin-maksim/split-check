import { MoveRight } from 'lucide-react'

import { cn, formatMoney } from '@shared/lib'
import { AnimatedNumber, Button, EButtonVariant } from '@shared/ui'

type TMergedTransferRowProps = {
  fromLabel: string
  to: string
  amount: number
  mergeMode: boolean
  selected: boolean
  onSelectToggle: () => void
  onScrollFrom: () => void
  onScrollTo: () => void
}

export const MergedTransferRow = ({
  fromLabel,
  to,
  amount,
  mergeMode,
  selected,
  onSelectToggle,
  onScrollFrom,
  onScrollTo,
}: TMergedTransferRowProps) => (
  <div className="w-transfers-card__item">
    <h4 className="w-transfers-card__amount">
      <AnimatedNumber value={amount} format={formatMoney} className="h4" />
    </h4>
    <div className="w-transfers-card__people">
      <Button
        className={cn(
          'button--wide',
          'w-transfers-card__person--merged-from',
          mergeMode && 'w-transfers-card__person--from-selectable',
          mergeMode && 'w-transfers-card__person--shake',
          mergeMode && selected && 'button--active',
        )}
        onClick={mergeMode ? onSelectToggle : onScrollFrom}
        aria-pressed={mergeMode ? selected : undefined}
        aria-label={
          mergeMode
            ? `${selected ? 'Снять выбор' : 'Выбрать'} объединённых отправителей → ${to}`
            : `Перейти к статистике: ${fromLabel.replace(/\n/g, ', ')}`
        }
      >
        {fromLabel}
      </Button>
      <MoveRight size={'var(--transfer-card-icon-size)'} aria-hidden="true" />
      <Button
        variant={EButtonVariant.Wide}
        type="button"
        onClick={onScrollTo}
        title={`Статистика: ${to}`}
        aria-label={`Перейти к статистике: ${to}`}
      >
        {to}
      </Button>
    </div>
  </div>
)
