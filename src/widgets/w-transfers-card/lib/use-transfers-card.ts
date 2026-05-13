import { useMemo, useState, useCallback, useLayoutEffect, useRef } from 'react'

import type { TTransfer } from '@entities/check'
import {
  transferListSignature,
  getRecipientCounts,
  canMergeSelection,
  applyMerge,
  canUnmergeSelection,
  applyUnmerge,
  buildDisplayTransfers,
} from '@entities/check'

type TUseTransfersCardParams = {
  transfers: TTransfer[]
}

export const useTransfersCard = ({ transfers }: TUseTransfersCardParams) => {
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

  return {
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
  }
}
