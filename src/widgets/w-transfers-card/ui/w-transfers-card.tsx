import { useMemo, useState, useCallback, useLayoutEffect, useRef } from 'react'
import { MoveRight, Combine } from 'lucide-react'

import type { TTransfer } from '@/entities/check'
import {
  transferListSignature,
  getRecipientCounts,
  isEligibleForMerge,
  canMergeSelection,
  applyMerge,
  canUnmergeSelection,
  applyUnmerge,
  buildDisplayTransfers,
} from '@/entities/check'

import { cn, formatMoney } from '@/shared/lib'
import { Button, EButtonVariant, IconButton, Spinner } from '@/shared/ui'

import './w-transfers-card.scss'

type TWTransfersCardProps = {
  transfers: TTransfer[]
  isLoading: boolean
}

export const WTransfersCard = ({ transfers, isLoading }: TWTransfersCardProps) => {
  const [mergeMode, setMergeMode] = useState(false)
  const [pendingSelection, setPendingSelection] = useState<Set<number>>(() => new Set())
  const [committedGroups, setCommittedGroups] = useState<number[][]>(() => [])

  const transfersSig = useMemo(() => transferListSignature(transfers), [transfers])

  const lastHydratedSigRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (!transfers.length) {
      lastHydratedSigRef.current = null
      return
    }
    if (lastHydratedSigRef.current === transfersSig) return
    lastHydratedSigRef.current = transfersSig

    setMergeMode(false)
    setPendingSelection(new Set())
    setCommittedGroups([])
  }, [transfersSig, transfers])

  const recipientCounts = useMemo(() => getRecipientCounts(transfers), [transfers])

  const displayRows = useMemo(() => buildDisplayTransfers(transfers, committedGroups), [transfers, committedGroups])

  const mergeAllowed = useMemo(
    () => canMergeSelection(pendingSelection, transfers, committedGroups),
    [pendingSelection, transfers, committedGroups],
  )

  const unmergeAllowed = useMemo(
    () => canUnmergeSelection(pendingSelection, committedGroups),
    [pendingSelection, committedGroups],
  )

  const toggleMergeMode = useCallback(() => {
    setMergeMode((m) => {
      if (m) setPendingSelection(new Set())
      return !m
    })
  }, [])

  const toggleSelectIndex = useCallback((index: number) => {
    setPendingSelection((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const toggleMergedGroup = useCallback((sourceIndices: number[]) => {
    setPendingSelection((prev) => {
      const next = new Set(prev)
      const allIn = sourceIndices.every((i) => next.has(i))
      if (allIn) {
        for (const i of sourceIndices) next.delete(i)
      } else {
        for (const i of sourceIndices) next.add(i)
      }
      return next
    })
  }, [])

  const handleMerge = useCallback(() => {
    if (!canMergeSelection(pendingSelection, transfers, committedGroups)) return
    setCommittedGroups((g) => applyMerge(pendingSelection, g))
    setPendingSelection(new Set())
  }, [pendingSelection, transfers, committedGroups])

  const handleUnmerge = useCallback(() => {
    if (!canUnmergeSelection(pendingSelection, committedGroups)) return
    setCommittedGroups((g) => applyUnmerge(pendingSelection, g))
    setPendingSelection(new Set())
  }, [pendingSelection, committedGroups])

  return (
    <div className="w-transfers-card">
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
                <h4 className="w-transfers-card__amount">{formatMoney(row.amount)}</h4>
                <div className="w-transfers-card__people">
                  <Button
                    className={cn(
                      'button--wide',
                      'w-transfers-card__person--merged-from',
                      mergeMode && 'w-transfers-card__person--from-selectable',
                      mergeMode && 'w-transfers-card__person--shake',
                      mergeMode && mergedSelected && 'button--active',
                    )}
                    onClick={mergeMode ? () => toggleMergedGroup(row.sourceIndices) : undefined}
                    aria-pressed={mergeMode ? mergedSelected : undefined}
                    aria-label={
                      mergeMode
                        ? `${mergedSelected ? 'Снять выбор' : 'Выбрать'} объединённых отправителей → ${row.to}`
                        : undefined
                    }
                  >
                    {row.fromLabel}
                  </Button>
                  <MoveRight size={40} aria-hidden="true" />
                  <Button>{row.to}</Button>
                </div>
              </div>
            )
          }

          const { index, transfer } = row
          const eligible = isEligibleForMerge(index, transfers, recipientCounts)
          const selected = pendingSelection.has(index)

          return (
            <div key={row.key} className="w-transfers-card__item">
              <h4 className="w-transfers-card__amount">{formatMoney(transfer.amount)}</h4>
              <div className="w-transfers-card__people">
                <Button
                  className={cn(
                    'button--wide',
                    mergeMode && eligible && 'w-transfers-card__person--from-selectable',
                    mergeMode && eligible && 'w-transfers-card__person--shake',
                    mergeMode && eligible && selected && 'button--active',
                  )}
                  onClick={mergeMode && eligible ? () => toggleSelectIndex(index) : undefined}
                  aria-pressed={mergeMode && eligible ? selected : undefined}
                  aria-label={
                    mergeMode && eligible
                      ? `${selected ? 'Снять выбор' : 'Выбрать'}: ${transfer.from} → ${transfer.to}`
                      : undefined
                  }
                >
                  {transfer.from}
                </Button>
                <MoveRight size={40} aria-hidden="true" />
                <Button>{transfer.to}</Button>
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
