export type TScannedItem = {
  title: string
  price: number
  qty: number
  totalPrice: number
}

export type TReceiptSource = 'camera' | 'gallery'

export type TPreviewQuantities = Record<number, number>
