import {
  GoogleGenerativeAI,
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIResponseError,
} from '@google/generative-ai'

import {
  GEMINI_MODEL_INDEX_KEY,
  GEMINI_MODELS,
  RECEIPT_ANALYZE_PROMPT,
  RECEIPT_ITEMS_RESPONSE_SCHEMA,
} from '../model'
import type { TScannedItem } from '../model'

export type TAnalyzeReceiptOptions = {
  signal?: AbortSignal
}

const getNextModel = (): string => {
  try {
    const idx = parseInt(localStorage.getItem(GEMINI_MODEL_INDEX_KEY) ?? '0', 10)
    const model = GEMINI_MODELS[idx % GEMINI_MODELS.length]!
    localStorage.setItem(GEMINI_MODEL_INDEX_KEY, String((idx + 1) % GEMINI_MODELS.length))
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

const isRetryableHttpStatus = (status: number) =>
  status === 429 || status === 500 || status === 503 || status === 404

const isAbortError = (e: unknown): boolean => {
  if (e instanceof DOMException && e.name === 'AbortError') return true
  if (e instanceof GoogleGenerativeAIAbortError) return true
  return e instanceof Error && e.name === 'AbortError'
}

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }
}

const stripGenAiPrefix = (message: string) => message.replace(/^\[GoogleGenerativeAI Error\]: /, '')

const logReceiptScan = (label: string, payload: unknown) => {
  console.log(`[receipt-scan] ${label}`, typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2))
}

export const analyzeReceipt = async (
  file: File,
  options: TAnalyzeReceiptOptions = {},
): Promise<TScannedItem[]> => {
  const { signal } = options
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) throw new Error('API ключ не настроен')

  const firstModel = getNextModel()
  const otherModels = GEMINI_MODELS.filter((m) => m !== firstModel)
  const modelsToTry = [firstModel, ...otherModels]

  const base64 = await fileToBase64(file)
  const mimeType = file.type || 'image/jpeg'

  const genAI = new GoogleGenerativeAI(apiKey)

  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    throwIfAborted(signal)

    const modelName = modelsToTry[attempt]!

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RECEIPT_ITEMS_RESPONSE_SCHEMA,
        },
      })

      const genResult = await model.generateContent(
        {
          contents: [
            {
              role: 'user',
              parts: [
                { text: RECEIPT_ANALYZE_PROMPT },
                { inlineData: { mimeType, data: base64 } },
              ],
            },
          ],
        },
        { signal },
      )

      throwIfAborted(signal)

      const answerText = genResult.response.text().trim()
      logReceiptScan('ответ модели (сырой JSON)', answerText)

      let parsed: unknown
      try {
        parsed = JSON.parse(answerText)
      } catch {
        throw new Error('PARSE_JSON_FAILED')
      }

      if (!Array.isArray(parsed)) {
        throw new Error('INVALID_JSON_SHAPE')
      }

      const rawItems = parsed as TScannedItem[]

      return rawItems
    } catch (e) {
      if (isAbortError(e)) throw e

      const hasNextModel = attempt < modelsToTry.length - 1
      const backoff = Math.min(800 * (attempt + 1), 5000)

      if (e instanceof GoogleGenerativeAIFetchError) {
        const status = e.status ?? 0
        if (isRetryableHttpStatus(status) && hasNextModel) {
          const wait = status === 429 ? Math.min(1500 * (attempt + 1), 10_000) : backoff
          await sleep(wait)
          continue
        }
        if (status === 429) {
          throw new Error(
            'Слишком много запросов к Google AI (лимит квоты). Подождите минуту и попробуйте снова или проверьте план в Google AI Studio.',
          )
        }
        throw new Error(stripGenAiPrefix(e.message))
      }

      if (e instanceof GoogleGenerativeAIResponseError) {
        if (hasNextModel) {
          await sleep(backoff)
          continue
        }
        throw new Error(stripGenAiPrefix(e.message) || 'Ответ модели заблокирован или недоступен')
      }

      const msg = e instanceof Error ? e.message : ''
      const parseOrShapeFailed = msg === 'PARSE_JSON_FAILED' || msg === 'INVALID_JSON_SHAPE'

      if (parseOrShapeFailed && hasNextModel) {
        await sleep(backoff)
        continue
      }

      if (parseOrShapeFailed) {
        throw new Error(msg === 'INVALID_JSON_SHAPE' ? 'Не удалось распознать позиции' : 'Не удалось разобрать ответ модели')
      }

      if (hasNextModel) {
        await sleep(backoff)
        continue
      }

      throw e instanceof Error ? e : new Error('Ошибка распознавания чека')
    }
  }

  throw new Error('Не удалось обратиться к API распознавания')
}
