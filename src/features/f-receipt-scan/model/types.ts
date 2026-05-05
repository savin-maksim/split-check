export type TScannedItem = {
  title: string
  price: number
  qty: number
}

/** Этапы клиентского прогресса при вызове Gemini (streamGenerateContent). */
export type TReceiptAnalyzePhase = 'encoding' | 'requesting' | 'streaming' | 'parsing'

export type TReceiptSource = 'camera' | 'gallery'

export type TPreviewQuantities = Record<number, number>
