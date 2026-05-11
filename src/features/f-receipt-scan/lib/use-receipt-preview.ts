import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  bumpPreviewQuantity,
  calculateSelectedTotal,
  createInitialQuantities,
  createInitialSelection,
  toggleSelectedIndex,
  updatePreviewQuantity,
} from './preview-state'
import type { TPreviewQuantities, TScannedItem } from '../model'

export const useReceiptPreview = () => {
  const [scannedItems, setScannedItems] = useState<TScannedItem[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(() => new Set())
  const [quantities, setQuantities] = useState<TPreviewQuantities>({})

  useEffect(() => {
    if (!isPreviewOpen) return
    setSelectedIndexes(createInitialSelection(scannedItems))
    setQuantities(createInitialQuantities(scannedItems))
  }, [isPreviewOpen, scannedItems])

  const totalAmount = useMemo(
    () => calculateSelectedTotal(scannedItems, selectedIndexes, quantities),
    [scannedItems, selectedIndexes, quantities],
  )

  const openPreview = useCallback((items: TScannedItem[]) => {
    setScannedItems(items)
    setIsPreviewOpen(true)
  }, [])

  const reset = useCallback(() => {
    setIsPreviewOpen(false)
    setScannedItems([])
    setSelectedIndexes(new Set())
    setQuantities({})
  }, [])

  const toggleItem = useCallback((index: number) => {
    setSelectedIndexes((prev) => toggleSelectedIndex(prev, index))
  }, [])

  const bumpQuantity = useCallback(
    (index: number, delta: number) => {
      setQuantities((prev) => bumpPreviewQuantity(prev, scannedItems, index, delta))
    },
    [scannedItems],
  )

  const updateItem = useCallback((index: number, item: TScannedItem) => {
    setScannedItems((prev) => prev.map((current, currentIndex) => (currentIndex === index ? item : current)))
    setQuantities((prev) => updatePreviewQuantity(prev, index, item.qty))
  }, [])

  return {
    scannedItems,
    isPreviewOpen,
    setIsPreviewOpen,
    selectedIndexes,
    quantities,
    totalAmount,
    openPreview,
    reset,
    toggleItem,
    bumpQuantity,
    updateItem,
  }
}
