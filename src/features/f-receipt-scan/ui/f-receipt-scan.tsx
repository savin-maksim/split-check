import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'

import { ScanLine } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { cn, formatItemTitle } from '@/shared/lib'
import { IconButton, EIconButtonVariant, Modal, Button, EButtonVariant } from '@/shared/ui'
import type { TItem, TPerson } from '@/entities/check'
import { EPaymentMode } from '@/entities/check'

import './f-receipt-scan.scss'

type TFReceiptScanProps = {
  people: TPerson[]
  paymentMode: EPaymentMode
  singlePayerId: number | null
  onAddItems: (items: Omit<TItem, 'id'>[]) => void
  className?: string
}

type TScannedItem = {
  title: string
  price: number
  qty: number
}

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']

const getNextModel = (): string => {
  try {
    const idx = parseInt(localStorage.getItem('gemini_model_idx') ?? '0', 10)
    const model = GEMINI_MODELS[idx % GEMINI_MODELS.length]!
    localStorage.setItem('gemini_model_idx', String((idx + 1) % GEMINI_MODELS.length))
    return model
  } catch {
    return GEMINI_MODELS[0]!
  }
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const analyzeReceipt = async (file: File): Promise<TScannedItem[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) throw new Error('API ключ не настроен')

  const model = getNextModel()
  const base64 = await fileToBase64(file)
  const mimeType = file.type || 'image/jpeg'

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Извлеки позиции из чека. Верни JSON массив: [{"title":"...","price":число,"qty":число}]. Только JSON, без пояснений.',
              },
              { inlineData: { mimeType, data: base64 } },
            ],
          },
        ],
      }),
    },
  )

  if (!resp.ok) throw new Error(`Ошибка API: ${resp.status}`)
  const data = await resp.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Не удалось распознать позиции')
  return JSON.parse(jsonMatch[0]) as TScannedItem[]
}

export const FReceiptScan = ({ people, paymentMode, singlePayerId, onAddItems, className }: TFReceiptScanProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [scannedItems, setScannedItems] = useState<TScannedItem[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setIsLoading(true)
    try {
      const items = await analyzeReceipt(file)
      if (!items.length) {
        toast.error('Позиции не найдены')
        return
      }
      setScannedItems(items)
      setIsPreviewOpen(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка сканирования')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmItems = () => {
    const defaultSplit: Record<number, number> = {}
    people.forEach((p) => {
      defaultSplit[p.id] = 1
    })

    const defaultPaidBy =
      paymentMode === EPaymentMode.Single && singlePayerId != null
        ? [singlePayerId]
        : people.length > 0
          ? [people[0]!.id]
          : []

    const items: Omit<TItem, 'id'>[] = scannedItems.map((si) => ({
      title: formatItemTitle(si.title),
      price: Math.round(si.price * 100),
      qty: si.qty || 1,
      paidBy: defaultPaidBy,
      split: { ...defaultSplit },
    }))

    onAddItems(items)
    setIsPreviewOpen(false)
    setScannedItems([])
    toast.success(`Добавлено ${items.length} позиций`)
  }

  return (
    <div className={cn('f-receipt-scan', className)}>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="f-receipt-scan__input" />
      <IconButton
        variant={EIconButtonVariant.Scanner}
        icon={<ScanLine size={'var(--button-icon-size)'} />}
        onClick={() => fileRef.current?.click()}
        disabled={isLoading}
        aria-label="Сканировать чек"
      />

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <h3 className="modal__title">Позиции из чека</h3>
        <div className="modal__inputs">
          {scannedItems.map((item, idx) => (
            <div key={idx} className="f-receipt-scan__preview-item">
              <span>{item.title}</span>
              <span>
                {item.qty} × {item.price} ₽
              </span>
            </div>
          ))}
        </div>
        <div className="modal__buttons">
          <Button onClick={() => setIsPreviewOpen(false)}>Отмена</Button>
          <Button variant={EButtonVariant.Active} onClick={handleConfirmItems}>
            Добавить все
          </Button>
        </div>
      </Modal>
    </div>
  )
}
