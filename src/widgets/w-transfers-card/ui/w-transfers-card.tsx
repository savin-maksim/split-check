import { useCallback } from 'react'
import { MoveRight, Combine } from 'lucide-react'

import type { TPerson, TTransfer } from '@/entities/check'
import { isEligibleForMerge } from '@/entities/check'

import { cn, formatMoney, scrollToPersonStatsAnchor } from '@/shared/lib'
import { AnimatedNumber, Button, EButtonVariant, IconButton, Spinner } from '@/shared/ui'

import { useTransfersCard } from '../lib/use-transfers-card'

import './w-transfers-card.scss'

type TWTransfersCardProps = {
  transfers: TTransfer[]
  isLoading: boolean
  checkId: string
  people: TPerson[]
}

export const WTransfersCard = ({ transfers, isLoading, checkId, people }: TWTransfersCardProps) => {
  const {
    mergeMode,
    pendingSelection,
    recipientCounts,
    displayRows,
    mergeAllowed,
    unmergeAllowed,
    toggleMergeMode,
    toggleSelectIndex,
    toggleMergedGroup,
    handleMerge,
    handleUnmerge,
  } = useTransfersCard({ transfers })

  const scrollToPersonByName = useCallback(
    (name: string) => {
      const person = people.find((p) => p.name === name)
      if (person) scrollToPersonStatsAnchor(checkId, person.id)
    },
    [people, checkId],
  )

  const scrollToMergedFromFirst = useCallback(
    (sourceIndices: number[]) => {
      const idx = sourceIndices[0]
      if (idx === undefined) return
      const name = transfers[idx]?.from
      if (name) scrollToPersonByName(name)
    },
    [transfers, scrollToPersonByName],
  )

  return (
    <div className="w-transfers-card" data-stat-share="transfers" data-stat-share-label="Переводы">
      <div className="w-transfers-card__header">
        <h3>Переводы</h3>
        <div className="w-transfers-card__header-actions">
          <IconButton
            icon={<Combine />}
            className={cn('w-transfers-card__merge-toggle', mergeMode && 'w-transfers-card__merge-toggle--active')}
            onClick={toggleMergeMode}
            aria-label={mergeMode ? 'Выключить режим объединения переводов' : 'Включить режим объединения переводов'}
            aria-pressed={mergeMode}
          />
          {isLoading && <Spinner />}
        </div>
      </div>

      <div className="w-transfers-card__transfers">
        {displayRows.map((row) => {
          if (row.kind === 'merged') {
            const mergedSelected = row.sourceIndices.every((i) => pendingSelection.has(i))

            return (
              <div key={row.key} className="w-transfers-card__item">
                <h4 className="w-transfers-card__amount">
                  <AnimatedNumber value={row.amount} format={formatMoney} className="h4" />
                </h4>
                <div className="w-transfers-card__people">
                  <Button
                    className={cn(
                      'button--wide',
                      'w-transfers-card__person--merged-from',
                      mergeMode && 'w-transfers-card__person--from-selectable',
                      mergeMode && 'w-transfers-card__person--shake',
                      mergeMode && mergedSelected && 'button--active',
                    )}
                    onClick={
                      mergeMode
                        ? () => toggleMergedGroup(row.sourceIndices)
                        : () => scrollToMergedFromFirst(row.sourceIndices)
                    }
                    aria-pressed={mergeMode ? mergedSelected : undefined}
                    aria-label={
                      mergeMode
                        ? `${mergedSelected ? 'Снять выбор' : 'Выбрать'} объединённых отправителей → ${row.to}`
                        : `Перейти к статистике: ${row.fromLabel.replace(/\n/g, ', ')}`
                    }
                  >
                    {row.fromLabel}
                  </Button>
                  <MoveRight size={'var(--transfer-card-icon-size)'} aria-hidden="true" />
                  <Button
                    variant={EButtonVariant.Wide}
                    type="button"
                    onClick={() => scrollToPersonByName(row.to)}
                    title={`Статистика: ${row.to}`}
                    aria-label={`Перейти к статистике: ${row.to}`}
                  >
                    {row.to}
                  </Button>
                </div>
              </div>
            )
          }

          const { index, transfer } = row
          const eligible = isEligibleForMerge(index, transfers, recipientCounts)
          const selected = pendingSelection.has(index)

          return (
            <div key={row.key} className="w-transfers-card__item">
              <AnimatedNumber value={transfer.amount} format={formatMoney} className="h4 w-transfers-card__amount" />
              <div className="w-transfers-card__people">
                <Button
                  className={cn(
                    'button--wide',
                    mergeMode && eligible && 'w-transfers-card__person--from-selectable',
                    mergeMode && eligible && 'w-transfers-card__person--shake',
                    mergeMode && eligible && selected && 'button--active',
                  )}
                  type="button"
                  onClick={() => {
                    if (mergeMode && eligible) toggleSelectIndex(index)
                    else scrollToPersonByName(transfer.from)
                  }}
                  aria-pressed={mergeMode && eligible ? selected : undefined}
                  aria-label={
                    mergeMode && eligible
                      ? `${selected ? 'Снять выбор' : 'Выбрать'}: ${transfer.from} → ${transfer.to}`
                      : `Перейти к статистике: ${transfer.from}`
                  }
                >
                  {transfer.from}
                </Button>
                <MoveRight
                  className="w-transfers-card__icon"
                  size={'var(--transfer-card-icon-size)'}
                  aria-hidden="true"
                />
                <Button
                  variant={EButtonVariant.Wide}
                  type="button"
                  onClick={() => scrollToPersonByName(transfer.to)}
                  title={`Статистика: ${transfer.to}`}
                  aria-label={`Перейти к статистике: ${transfer.to}`}
                >
                  {transfer.to}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {mergeMode && (
        <div className="w-transfers-card__merge-actions">
          <Button variant={EButtonVariant.Active} disabled={!mergeAllowed} onClick={handleMerge}>
            Объединить
          </Button>
          {unmergeAllowed && (
            <Button variant={EButtonVariant.Danger} onClick={handleUnmerge}>
              Разъединить
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
