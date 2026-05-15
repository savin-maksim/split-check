import { GEMINI_GENERATION_CONFIGS, type TGeminiModel, type TScannedItem } from '../model'
import { isAbortError } from './is-abort-error'
import { fileToBase64 } from './file-to-base64'
import { generateReceiptContent, ReceiptScanProxyError } from './receipt-scan-proxy-client'
import { buildModelRotationOrder } from './model-rotation'
import { parseReceiptResponse } from './parse-receipt-response'

export type TAnalyzeReceiptOptions = {
  signal?: AbortSignal
}

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }
}

const isParseFailureMessage = (msg: string) => msg === 'PARSE_JSON_FAILED' || msg === 'INVALID_JSON_SHAPE'

export const analyzeReceipt = async (file: File, options: TAnalyzeReceiptOptions = {}): Promise<TScannedItem[]> => {
  const { signal } = options
  const modelsToTry = buildModelRotationOrder()
  const base64 = await fileToBase64(file)
  const mimeType = file.type.startsWith('image/') ? 'image/jpeg' : file.type || 'image/jpeg'

  for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
    throwIfAborted(signal)

    const modelName = modelsToTry[attempt]!

    try {
      const text = await generateReceiptContent({
        modelName,
        base64,
        mimeType,
        generationConfig: GEMINI_GENERATION_CONFIGS[modelName as TGeminiModel],
        signal,
      })
      throwIfAborted(signal)
      return parseReceiptResponse(text)
    } catch (e) {
      if (isAbortError(e)) throw e

      const hasNextModel = attempt < modelsToTry.length - 1
      if (hasNextModel) continue

      if (e instanceof ReceiptScanProxyError) {
        const status = e.status ?? 0
        if (status === 429) {
          throw new Error(
            'Слишком много запросов к Google AI (лимит квоты). Подождите минуту и попробуйте снова или проверьте план в Google AI Studio.',
          )
        }
        if (status === 400) {
          throw new Error('Регион не поддерживается')
        }
        throw new Error(e.message)
      }

      const msg = e instanceof Error ? e.message : ''
      if (isParseFailureMessage(msg)) {
        throw new Error(
          msg === 'INVALID_JSON_SHAPE' ? 'Не удалось распознать позиции' : 'Не удалось разобрать ответ модели',
        )
      }

      throw e instanceof Error ? e : new Error('Ошибка распознавания чека')
    }
  }

  throw new Error('Не удалось обратиться к API распознавания')
}
