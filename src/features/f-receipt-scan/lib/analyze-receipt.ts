import { accumulateAnswerFromGeminiStream } from './parse-gemini-stream'
import { GEMINI_MODEL_INDEX_KEY, GEMINI_MODELS, RECEIPT_ANALYZE_PROMPT } from '../model'
import type { TReceiptAnalyzePhase, TScannedItem } from '../model'

export type TAnalyzeReceiptOptions = {
  signal?: AbortSignal
  onPhase?: (phase: TReceiptAnalyzePhase) => void
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

const parseRetryAfterMs = (resp: Response): number | null => {
  const retryAfter = resp.headers.get('Retry-After')
  if (retryAfter == null) return null
  const seconds = parseInt(retryAfter, 10)
  if (Number.isNaN(seconds)) return null
  return Math.min(seconds * 1000, 60_000)
}

const isRetryableStatus = (status: number) => status === 429 || status === 500 || status === 503 || status === 404

const isAbortError = (e: unknown): boolean => {
  if (e instanceof DOMException && e.name === 'AbortError') return true
  return e instanceof Error && e.name === 'AbortError'
}

const buildRequestBody = (base64: string, mimeType: string) =>
  JSON.stringify({
    contents: [
      {
        parts: [{ text: RECEIPT_ANALYZE_PROMPT }, { inlineData: { mimeType, data: base64 } }],
      },
    ],
    generationConfig: {
      thinkingConfig: {
        includeThoughts: true,
      },
    },
  })

export const analyzeReceipt = async (
  file: File,
  options: TAnalyzeReceiptOptions = {},
): Promise<TScannedItem[]> => {
  const { signal, onPhase } = options
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) throw new Error('API ключ не настроен')

  const firstModel = getNextModel()
  const otherModels = GEMINI_MODELS.filter((model) => model !== firstModel)
  const modelsToTry = [firstModel, ...otherModels]

  onPhase?.('encoding')
  const base64 = await fileToBase64(file)
  const mimeType = file.type || 'image/jpeg'
  const body = buildRequestBody(base64, mimeType)

  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const model = modelsToTry[attempt]!
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`

    onPhase?.('requesting')

    let resp: Response
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal,
      })
    } catch (e) {
      if (isAbortError(e)) throw e
      if (attempt < modelsToTry.length - 1) {
        await sleep(Math.min(800 * (attempt + 1), 5000))
        continue
      }
      throw e instanceof Error ? e : new Error('Сеть недоступна')
    }

    if (!resp.ok) {
      let message = `Ошибка API: ${resp.status}`
      try {
        const errJson: { error?: { message?: string } } = await resp.json()
        if (errJson?.error?.message) message = errJson.error.message
      } catch {
        // Response body can be empty or non-JSON for transport-level failures.
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

    onPhase?.('streaming')

    if (!resp.body) {
      if (attempt < modelsToTry.length - 1) {
        await sleep(Math.min(800 * (attempt + 1), 5000))
        continue
      }
      throw new Error('Пустой ответ')
    }

    let answerText: string
    try {
      answerText = await accumulateAnswerFromGeminiStream(resp.body, {
        signal,
      })
    } catch (e) {
      if (isAbortError(e)) throw e
      if (attempt < modelsToTry.length - 1) {
        await sleep(Math.min(800 * (attempt + 1), 5000))
        continue
      }
      throw e instanceof Error ? e : new Error('Ошибка чтения ответа')
    }

    onPhase?.('parsing')
    const jsonMatch = answerText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      if (attempt < modelsToTry.length - 1) {
        await sleep(Math.min(800 * (attempt + 1), 5000))
        continue
      }
      throw new Error('Не удалось распознать позиции')
    }

    return JSON.parse(jsonMatch[0]) as TScannedItem[]
  }

  throw new Error('Не удалось обратиться к API распознавания')
}
