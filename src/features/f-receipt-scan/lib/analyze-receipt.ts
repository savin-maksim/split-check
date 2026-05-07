import { GoogleGenerativeAIFetchError, GoogleGenerativeAIResponseError } from '@google/generative-ai'

import type { TScannedItem } from '../model'
import { isAbortError } from './is-abort-error'
import { fileToBase64 } from './file-to-base64'
import { generateReceiptContent } from './gemini-client'
import { buildModelRotationOrder, getNextModel } from './model-rotation'
import { parseReceiptResponse } from './parse-receipt-response'

export type TAnalyzeReceiptOptions = {
  signal?: AbortSignal
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isRetryableHttpStatus = (status: number) =>
  status === 429 || status === 500 || status === 503 || status === 404

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }
}

const stripGenAiPrefix = (message: string) => message.replace(/^\[GoogleGenerativeAI Error\]: /, '')

const isParseFailureMessage = (msg: string) => msg === 'PARSE_JSON_FAILED' || msg === 'INVALID_JSON_SHAPE'

export const analyzeReceipt = async (
  file: File,
  options: TAnalyzeReceiptOptions = {},
): Promise<TScannedItem[]> => {
  const { signal } = options
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (typeof apiKey !== 'string' || apiKey.length === 0) throw new Error('API ключ не настроен')

  const modelsToTry = buildModelRotationOrder(getNextModel())
  const base64 = await fileToBase64(file)
  const mimeType = file.type || 'image/jpeg'

  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    throwIfAborted(signal)

    const modelName = modelsToTry[attempt]!

    try {
      const text = await generateReceiptContent({ apiKey, modelName, base64, mimeType, signal })
      throwIfAborted(signal)
      return parseReceiptResponse(text)
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
      if (isParseFailureMessage(msg)) {
        if (hasNextModel) {
          await sleep(backoff)
          continue
        }
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
