import { MoveRight } from 'lucide-react'

import { cn, formatMoney } from '@shared/lib'
import { AnimatedNumber, Button, EButtonVariant } from '@shared/ui'

type TTransferRowProps = {
  from: string
  to: string
  amount: number
  /** Режим объединения активен и эта строка может быть выбрана для объединения. */
  selectable: boolean
  selected: boolean
  onSelectToggle: () => void
  onScrollFrom: () => void
  onScrollTo: () => void
}

export const TransferRow = ({
  from,
  to,
  amount,
  selectable,
  selected,
  onSelectToggle,
  onScrollFrom,
  onScrollTo,
}: TTransferRowProps) => (
  <div className="w-transfers-card__item">
    <AnimatedNumber value={amount} format={formatMoney} className="h4 w-transfers-card__amount" />
    <div className="w-transfers-card__people">
      <Button
        className={cn(
          'button--wide',
          selectable && 'w-transfers-card__person--from-selectable',
          selectable && 'w-transfers-card__person--shake',
          selectable && selected && 'button--active',
        )}
        type="button"
        onClick={selectable ? onSelectToggle : onScrollFrom}
        aria-pressed={selectable ? selected : undefined}
        aria-label={
          selectable ? `${selected ? 'Снять выбор' : 'Выбрать'}: ${from} → ${to}` : `Перейти к статистике: ${from}`
        }
      >
        {from}
      </Button>
      <MoveRight className="w-transfers-card__icon" size={'var(--transfer-card-icon-size)'} aria-hidden="true" />
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
