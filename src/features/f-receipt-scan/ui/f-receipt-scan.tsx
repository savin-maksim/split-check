import { ScanLine } from 'lucide-react'

import type { TItem } from '@/entities/check'
import { FReceiptScanLoading, FReceiptScanLoadingBanner } from '@/features/f-receipt-scan-loading'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'

import { useReceiptScan } from '../lib'
import { ReceiptPreviewModal } from './receipt-preview-modal'
import { ReceiptSourceModal } from './receipt-source-modal'

import './f-receipt-scan.scss'

type TFReceiptScanProps = {
  onAddItems: (items: Omit<TItem, 'id'>[]) => void
  className?: string
}

export const FReceiptScan = ({ onAddItems, className }: TFReceiptScanProps) => {
  const {
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
  } = useReceiptScan({ onAddItems })

  return (
    <div className={cn('f-receipt-scan', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="f-receipt-scan__input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="f-receipt-scan__input"
      />
      <Button
        className="f-receipt-scan__button"
        icon={<ScanLine aria-hidden="true" className="f-receipt-scan__icon" size={'var(--button-icon-size)'} />}
        onClick={handleScanClick}
        disabled={isLoading}
        aria-label="Сканировать чек"
      >
        Сканировать чек
      </Button>

      <ReceiptSourceModal isOpen={isSourceOpen} onClose={() => setIsSourceOpen(false)} onSelect={handleSourceSelect} />

      <FReceiptScanLoading
        isOpen={isLoading && !isLoadingMinimized}
        onClose={handleLoadingModalClose}
        phaseLabel={analyzePhaseLabel}
        onCancel={handleCancelReceiptScan}
      />

      <FReceiptScanLoadingBanner
        isVisible={isLoading && isLoadingMinimized}
        onExpand={handleExpandReceiptScanLoading}
      />

      <ReceiptPreviewModal
        isOpen={isPreviewOpen}
        items={scannedItems}
        quantities={quantities}
        selectedIndexes={selectedIndexes}
        totalAmount={totalAmount}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={handleConfirmItems}
        onToggleItem={handleToggleItem}
        onBumpQuantity={handleBumpQuantity}
      />
    </div>
  )
}
