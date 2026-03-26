import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import { ArrowRight, Combine } from 'lucide-react'
import PersonButton from '../../Button/PersonButton'
import IconButton from '../../Button/IconButton'
import Spinner from '../../Spinner/Spinner'
import { StorageService } from '../../../services/storage'
import {
  applyMerge,
  applyUnmerge,
  buildDisplayTransfers,
  canMergeSelection,
  canUnmergeSelection,
  getRecipientCounts,
  isEligibleForMerge,
  transferListSignature,
  validateCommittedGroups,
} from '../../../utils/mergeTransferDisplay'
import './transfer-card.scss'

function TransferCard({ transfers, isLoading }) {
  const [mergeMode, setMergeMode] = useState(false)
  const [pendingSelection, setPendingSelection] = useState(() => new Set())
  const [committedGroups, setCommittedGroups] = useState(() => [])

  const transfersSig = useMemo(
    () => transferListSignature(transfers),
    [transfers]
  )

  const lastHydratedSigRef = useRef(null)

  useLayoutEffect(() => {
    if (!transfers.length) {
      lastHydratedSigRef.current = null
      return
    }
    if (lastHydratedSigRef.current === transfersSig) return
    lastHydratedSigRef.current = transfersSig

    const saved = StorageService.getTransferMergeUi()
    if (!saved || saved.transfersSig !== transfersSig) {
      setMergeMode(false)
      setPendingSelection(new Set())
      setCommittedGroups([])
      return
    }
    setMergeMode(!!saved.mergeMode)
    const pending = new Set()
    for (const i of saved.pendingSelection ?? saved.selectedIndices ?? []) {
      if (i >= 0 && i < transfers.length) pending.add(i)
    }
    setPendingSelection(pending)
    setCommittedGroups(
      validateCommittedGroups(transfers, saved.committedGroups ?? [])
    )
  }, [transfersSig, transfers])

  useEffect(() => {
    if (!transfers.length) return
    StorageService.setTransferMergeUi({
      mergeMode,
      pendingSelection: [...pendingSelection],
      committedGroups,
      transfersSig,
    })
  }, [mergeMode, pendingSelection, committedGroups, transfersSig, transfers.length])

  const recipientCounts = useMemo(
    () => getRecipientCounts(transfers),
    [transfers]
  )

  const displayRows = useMemo(
    () => buildDisplayTransfers(transfers, committedGroups),
    [transfers, committedGroups]
  )

  const mergeAllowed = useMemo(
    () => canMergeSelection(pendingSelection, transfers, committedGroups),
    [pendingSelection, transfers, committedGroups]
  )

  const unmergeAllowed = useMemo(
    () => canUnmergeSelection(pendingSelection, committedGroups),
    [pendingSelection, committedGroups]
  )

  const toggleMergeMode = useCallback(() => {
    setMergeMode((m) => {
      if (m) setPendingSelection(new Set())
      return !m
    })
  }, [])

  const toggleSelectIndex = useCallback((index) => {
    setPendingSelection((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const toggleMergedGroup = useCallback((sourceIndices) => {
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="transfer-card">
      <div className="transfer-card__header">
        <h3>Переводы</h3>
        <div className="transfer-card__header-actions">
          <IconButton
            icon={<Combine size={20} />}
            className={`transfer-card__merge-toggle${mergeMode ? ' transfer-card__merge-toggle--active' : ''}`}
            onClick={toggleMergeMode}
            ariaLabel={
              mergeMode
                ? 'Выключить режим объединения переводов'
                : 'Включить режим объединения переводов'
            }
            ariaPressed={mergeMode}
          />
          {isLoading && <Spinner />}
        </div>
      </div>

      <div className="transfer-card__transfers">
        {displayRows.map((row) => {
          if (row.kind === 'merged') {
            const mergedSelected = row.sourceIndices.every((i) =>
              pendingSelection.has(i)
            )
            const fromClasses = [
              'transfer-card__person',
              'transfer-card__person--merged-from',
              mergeMode && 'transfer-card__person--from-selectable',
              mergeMode && 'transfer-card__person--shake',
              mergeMode && mergedSelected && 'button__person--active',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div key={row.key} className="transfer-card__item">
                <div className="transfer-card__people">
                  <PersonButton
                    className={fromClasses}
                    onClick={
                      mergeMode
                        ? () => toggleMergedGroup(row.sourceIndices)
                        : undefined
                    }
                    ariaPressed={mergeMode ? mergedSelected : undefined}
                    ariaLabel={
                      mergeMode
                        ? `${mergedSelected ? 'Снять выбор' : 'Выбрать'} объединённых отправителей → ${row.to}`
                        : undefined
                    }
                  >
                    {row.fromLabel}
                  </PersonButton>
                  <ArrowRight size={20} aria-hidden />
                  <PersonButton className="transfer-card__person">
                    {row.to}
                  </PersonButton>
                </div>
                <h4 className="">
                  {formatAmount(row.amount)}
                </h4>
              </div>
            )
          }

          const { index, transfer } = row
          const eligible = isEligibleForMerge(index, transfers, recipientCounts)
          const selected = pendingSelection.has(index)
          const fromClasses = [
            'transfer-card__person',
            mergeMode && eligible && 'transfer-card__person--from-selectable',
            mergeMode && eligible && 'transfer-card__person--shake',
            mergeMode && eligible && selected && 'button__person--active',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div key={row.key} className="transfer-card__item">
              <div className="transfer-card__people">
                <PersonButton
                  className={fromClasses}
                  onClick={
                    mergeMode && eligible
                      ? () => toggleSelectIndex(index)
                      : undefined
                  }
                  ariaPressed={mergeMode && eligible ? selected : undefined}
                  ariaLabel={
                    mergeMode && eligible
                      ? `${selected ? 'Снять выбор' : 'Выбрать'}: ${transfer.from} → ${transfer.to}`
                      : undefined
                  }
                >
                  {transfer.from}
                </PersonButton>
                <ArrowRight size={20} aria-hidden />
                <PersonButton className="transfer-card__person">
                  {transfer.to}
                </PersonButton>
              </div>
              <h4 className="transfer-card__amount">
                {formatAmount(transfer.amount)}
              </h4>
            </div>
          )
        })}
      </div>

      {mergeMode && (
        <div className="transfer-card__merge-actions">
          <button
            type="button"
            className="transfer-card__merge-action transfer-card__merge-action--primary"
            disabled={!mergeAllowed}
            onClick={handleMerge}
          >
            Объединить
          </button>
          {unmergeAllowed && (
            <button
              type="button"
              className="transfer-card__merge-action transfer-card__merge-action--secondary"
              onClick={handleUnmerge}
            >
              Разъединить
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TransferCard
