import { useState, useRef, useEffect, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { toast } from 'react-hot-toast'

import type { TItem } from '@/entities/check'

import { analyzeReceipt } from './analyze-receipt'
import { buildScannedItems } from './build-scanned-items'
import {
  bumpPreviewQuantity,
  calculateSelectedTotal,
  createInitialQuantities,
  createInitialSelection,
  toggleSelectedIndex,
} from './preview-state'
import { RECEIPT_ANALYZE_PHASE_LABEL } from '../model'
import type { TPreviewQuantities, TReceiptAnalyzePhase, TReceiptSource, TScannedItem } from '../model'

type TUseReceiptScanParams = {
  onAddItems: (items: Omit<TItem, 'id'>[]) => void
}

const isAbortError = (e: unknown): boolean => {
  if (e instanceof DOMException && e.name === 'AbortError') return true
  return e instanceof Error && e.name === 'AbortError'
}

export const useReceiptScan = ({ onAddItems }: TUseReceiptScanParams) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMinimized, setIsLoadingMinimized] = useState(false)
  const [analyzePhase, setAnalyzePhase] = useState<TReceiptAnalyzePhase | null>(null)
  const [scannedItems, setScannedItems] = useState<TScannedItem[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(() => new Set())
  const [quantities, setQuantities] = useState<TPreviewQuantities>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const abortScanRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!isPreviewOpen) return

    setSelectedIndexes(createInitialSelection(scannedItems))
    setQuantities(createInitialQuantities(scannedItems))
  }, [isPreviewOpen, scannedItems])

  const totalAmount = useMemo(
    () => calculateSelectedTotal(scannedItems, selectedIndexes, quantities),
    [scannedItems, selectedIndexes, quantities],
  )

  const analyzePhaseLabel = useMemo(
    () => (analyzePhase ? RECEIPT_ANALYZE_PHASE_LABEL[analyzePhase] : null),
    [analyzePhase],
  )

  const handleScanClick = () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      toast.error('API ключ не настроен. См. инструкцию в README.')
      return
    }

    setIsSourceOpen(true)
  }

  const handleSourceSelect = (source: TReceiptSource) => {
    setIsSourceOpen(false)
    window.setTimeout(() => {
      if (source === 'camera') {
        cameraInputRef.current?.click()
        return
      }

      fileInputRef.current?.click()
    }, 100)
  }

  const handleCancelReceiptScan = () => {
    abortScanRef.current?.abort()
  }

  const handleLoadingModalClose = () => {
    setIsLoadingMinimized(true)
  }

  const handleExpandReceiptScanLoading = () => {
    setIsLoadingMinimized(false)
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const controller = new AbortController()
    abortScanRef.current = controller

    setIsLoading(true)
    setIsLoadingMinimized(false)
    setAnalyzePhase('encoding')

    try {
      const items = await analyzeReceipt(file, {
        signal: controller.signal,
        onPhase: (phase) => {
          setAnalyzePhase(phase)
          if (phase === 'requesting') {
          }
        }
      })
      if (!items.length) {
        toast.error('Позиции не найдены')
        return
      }
      setScannedItems(items)
      setIsPreviewOpen(true)
    } catch (err) {
      if (isAbortError(err)) {
        toast('Отменено')
        return
      }
      toast.error(err instanceof Error ? err.message : 'Ошибка сканирования')
    } finally {
      setIsLoading(false)
      setIsLoadingMinimized(false)
      setAnalyzePhase(null)
      abortScanRef.current = null
    }
  }

  const handleToggleItem = (index: number) => {
    setSelectedIndexes((prev) => toggleSelectedIndex(prev, index))
  }

  const handleBumpQuantity = (index: number, delta: number) => {
    setQuantities((prev) => bumpPreviewQuantity(prev, scannedItems, index, delta))
  }

  const handleConfirmItems = () => {
    const items = buildScannedItems({ scannedItems, selectedIndexes, quantities })
    if (items.length === 0) return

    onAddItems(items)
    setIsPreviewOpen(false)
    setScannedItems([])
    setSelectedIndexes(new Set())
    setQuantities({})
    toast.success(`Добавлено ${items.length} позиций`)
  }

  return {
    fileInputRef,
    cameraInputRef,
    isLoading,
    isLoadingMinimized,
    analyzePhaseLabel,
    isSourceOpen,
    setIsSourceOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    scannedItems,
    selectedIndexes,
    quantities,
    totalAmount,
    handleScanClick,
    handleSourceSelect,
    handleFileChange,
    handleToggleItem,
    handleBumpQuantity,
    handleConfirmItems,
    handleCancelReceiptScan,
    handleLoadingModalClose,
    handleExpandReceiptScanLoading,
  }
}
