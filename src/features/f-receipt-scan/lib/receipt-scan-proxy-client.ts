import type { TGeminiGenerationConfig } from '../model'

type TGenerateReceiptParams = {
  modelName: string
  base64: string
  mimeType: string
  generationConfig?: TGeminiGenerationConfig
  signal?: AbortSignal
}

type TProxySuccessResponse = {
  text: string
}

type TProxyErrorResponse = {
  message?: string
}

export class ReceiptScanProxyError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ReceiptScanProxyError'
  }
}

const getReceiptScanFunctionUrl = (): string => {
  const url = import.meta.env.VITE_RECEIPT_SCAN_FUNCTION_URL
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('API распознавания не настроен')
  }
  return url
}

export const generateReceiptContent = async ({
  modelName,
  base64,
  mimeType,
  generationConfig,
  signal,
}: TGenerateReceiptParams): Promise<string> => {
  const response = await fetch(getReceiptScanFunctionUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modelName, base64, mimeType, generationConfig }),
    signal,
  })

  const data = (await response.json().catch(() => ({}))) as TProxySuccessResponse | TProxyErrorResponse

  if (!response.ok) {
    throw new ReceiptScanProxyError(
      'message' in data && data.message ? data.message : 'Не удалось обратиться к API распознавания',
      response.status,
    )
  }

  if (!('text' in data) || typeof data.text !== 'string') {
    throw new Error('INVALID_JSON_SHAPE')
  }

  return data.text.trim()
}
