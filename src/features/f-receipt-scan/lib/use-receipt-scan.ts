import type { ChangeEvent } from 'react'
import { toast } from 'react-hot-toast'

import type { TItem } from '@/entities/check'

import { analyzeReceipt } from './analyze-receipt'
import { mergeDuplicateReceiptLines } from './merge-duplicate-receipt-lines'
import { buildScannedItems } from './build-scanned-items'
import { isAbortError } from './is-abort-error'
import { useReceiptSourceModal } from './use-receipt-source-modal'
import { useReceiptLoadingState } from './use-receipt-loading-state'
import { useReceiptPreview } from './use-receipt-preview'

type TUseReceiptScanParams = {
  onAddItems: (items: Omit<TItem, 'id'>[]) => void
}

export const useReceiptScan = ({ onAddItems }: TUseReceiptScanParams) => {
  const source = useReceiptSourceModal()
  const loading = useReceiptLoadingState()
  const preview = useReceiptPreview()

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const controller = loading.start()

    try {
      const items = mergeDuplicateReceiptLines(await analyzeReceipt(file, { signal: controller.signal }))
      if (!items.length) {
        toast.error('Позиции не найдены')
        return
      }
      preview.openPreview(items)
    } catch (err) {
      if (isAbortError(err)) {
        toast('Отменено')
        return
      }
      toast.error(err instanceof Error ? err.message : 'Ошибка сканирования')
    } finally {
      loading.finish()
    }
  }

  const handleConfirmItems = () => {
    const items = buildScannedItems({
      scannedItems: preview.scannedItems,
      selectedIndexes: preview.selectedIndexes,
      quantities: preview.quantities,
    })
    if (items.length === 0) return

    onAddItems(items)
    preview.reset()
    toast.success(`Добавлено ${items.length} позиций`)
  }

  return {
    fileInputRef: source.fileInputRef,
    cameraInputRef: source.cameraInputRef,
    isLoading: loading.isLoading,
    isLoadingMinimized: loading.isMinimized,
    isSourceOpen: source.isSourceOpen,
    setIsSourceOpen: source.setIsSourceOpen,
    isPreviewOpen: preview.isPreviewOpen,
    setIsPreviewOpen: preview.setIsPreviewOpen,
    scannedItems: preview.scannedItems,
    selectedIndexes: preview.selectedIndexes,
    quantities: preview.quantities,
    totalAmount: preview.totalAmount,
    handleScanClick: source.openSourceModal,
    handleSourceSelect: source.handleSourceSelect,
    handleFileChange,
    handleToggleItem: preview.toggleItem,
    handleBumpQuantity: preview.bumpQuantity,
    handleConfirmItems,
    handleCancelReceiptScan: loading.cancel,
    handleLoadingModalClose: loading.minimize,
    handleExpandReceiptScanLoading: loading.expand,
  }
}
