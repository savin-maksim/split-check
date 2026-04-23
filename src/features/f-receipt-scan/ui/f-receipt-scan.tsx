import { useState, useRef, memo } from 'react'
import type { ChangeEvent } from 'react'

import { ScanLine } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { cn, formatItemTitle } from '@/shared/lib'
import { Modal, Button, EButtonVariant } from '@/shared/ui'
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

interface IScannedItemProps {
  item: TScannedItem
}

const ScannedItem = memo(({ item }: IScannedItemProps) => (
  <div className="f-receipt-scan__preview-item">
    <span>{item.title}</span>
    <span>
      {item.qty} × {item.price} ₽
    </span>
  </div>
))

const GEMINI_MODELS = ['gemini-3.1-flash-lite-preview', 'gemini-3-flash-preview', 'gemini-3-pro-image-preview']

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const parseRetryAfterMs = (resp: Response): number | null => {
  const ra = resp.headers.get('Retry-After')
  if (ra == null) return null
  const sec = parseInt(ra, 10)
  if (Number.isNaN(sec)) return null
  return Math.min(sec * 1000, 60_000)
}

const isRetryableStatus = (status: number) => status === 429 || status === 500 || status === 503 || status === 404

const analyzeReceipt = async (file: File): Promise<TScannedItem[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) throw new Error('API ключ не настроен')

  const firstModel = getNextModel()
  const otherModels = GEMINI_MODELS.filter((m) => m !== firstModel)
  const modelsToTry = [firstModel, ...otherModels]

  const base64 = await fileToBase64(file)
  const mimeType = file.type || 'image/jpeg'
  const body = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: 'Извлеки позиции из чека. Верни JSON массив: [{"title":"...","price":число,"qty":число}]. Только JSON, без пояснений. Если встречаются позиции с одинаковым названием, суммируй их количество. Учитывай в чеке только количество, если там указаны литры или любые другие единицы, которые не относятся к количеству для позиции, пиши 1.',
          },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
  })

  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    const model = modelsToTry[attempt]!
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    if (resp.ok) {
      const data = await resp.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Не удалось распознать позиции')
      return JSON.parse(jsonMatch[0]) as TScannedItem[]
    }

    let message = `Ошибка API: ${resp.status}`
    try {
      const errJson: { error?: { message?: string } } = await resp.json()
      if (errJson?.error?.message) message = errJson.error.message
    } catch {
      // ignore
    }

    if (isRetryableStatus(resp.status) && attempt < modelsToTry.length - 1) {
      const wait = parseRetryAfterMs(resp) ?? Math.min(1500 * (attempt + 1), 10_000)
      if (resp.status === 429) {
        await sleep(wait)
        continue
      }
      await sleep(Math.min(800 * (attempt + 1), 5000))
      continue
    }

    if (resp.status === 429) {
      throw new Error(
        'Слишком много запросов к Google AI (лимит квоты). Подождите минуту и попробуйте снова или проверьте план в Google AI Studio.',
      )
    }
    throw new Error(message)
  }

  throw new Error('Не удалось обратиться к API распознавания')
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
      <Button
        icon={<ScanLine size={'var(--button-icon-size)'} />}
        onClick={() => fileRef.current?.click()}
        disabled={isLoading}
        aria-label="Сканировать чек"
      >
        Сканировать чек
      </Button>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <h3 className="modal__title">Позиции из чека</h3>
        <div className="modal__inputs">
          {scannedItems.map((item, idx) => (
            <ScannedItem key={idx} item={item} />
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
