import { useCallback } from 'react'
import { Combine } from 'lucide-react'

import type { TPerson, TTransfer } from '@/entities/check'
import { isEligibleForMerge } from '@/entities/check'
import { useRegisterStatTarget } from '@/features/f-statistics-share'

import { cn, scrollToPersonStatsAnchor } from '@/shared/lib'
import { Button, EButtonVariant, IconButton, Spinner } from '@/shared/ui'

import { useTransfersCard } from '../lib/use-transfers-card'
import { TransferRow } from './transfer-row'
import { MergedTransferRow } from './merged-transfer-row'

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

  const ref = useRegisterStatTarget<HTMLDivElement>({ id: 'transfers', kind: 'transfers', label: 'Переводы' })

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
    <div ref={ref} className="w-transfers-card">
      <div className="w-transfers-card__header">
        <h3>Переводы</h3>
        <div className="w-transfers-card__header-actions">
          <IconButton
            icon={<Combine />}
            className={cn('w-transfers-card__merge-toggle', mergeMode && 'w-transfers-card__merge-toggle--active')}
            onClick={toggleMergeMode}
            title={mergeMode ? 'Выключить режим объединения переводов' : 'Включить режим объединения переводов'}
            aria-label={mergeMode ? 'Выключить режим объединения переводов' : 'Включить режим объединения переводов'}
            aria-pressed={mergeMode}
          />
          {isLoading && <Spinner />}
        </div>
      </div>

      <div className="w-transfers-card__transfers">
        {displayRows.map((row) => {
          if (row.kind === 'merged') {
            const selected = row.sourceIndices.every((i) => pendingSelection.has(i))
            return (
              <MergedTransferRow
                key={row.key}
                fromLabel={row.fromLabel}
                to={row.to}
                amount={row.amount}
                mergeMode={mergeMode}
                selected={selected}
                onSelectToggle={() => toggleMergedGroup(row.sourceIndices)}
                onScrollFrom={() => scrollToMergedFromFirst(row.sourceIndices)}
                onScrollTo={() => scrollToPersonByName(row.to)}
              />
            )
          }

          const eligible = isEligibleForMerge(row.index, transfers, recipientCounts)
          const selectable = mergeMode && eligible
          const selected = pendingSelection.has(row.index)

          return (
            <TransferRow
              key={row.key}
              from={row.transfer.from}
              to={row.transfer.to}
              amount={row.transfer.amount}
              selectable={selectable}
              selected={selected}
              onSelectToggle={() => toggleSelectIndex(row.index)}
              onScrollFrom={() => scrollToPersonByName(row.transfer.from)}
              onScrollTo={() => scrollToPersonByName(row.transfer.to)}
            />
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
