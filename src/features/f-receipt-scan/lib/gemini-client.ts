import { GoogleGenerativeAI } from '@google/generative-ai'

import { RECEIPT_ANALYZE_PROMPT, RECEIPT_ITEMS_RESPONSE_SCHEMA } from '../model'

type TGenerateReceiptParams = {
  apiKey: string
  modelName: string
  base64: string
  mimeType: string
  signal?: AbortSignal
}

export const generateReceiptContent = async ({
  apiKey,
  modelName,
  base64,
  mimeType,
  signal,
}: TGenerateReceiptParams): Promise<string> => {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RECEIPT_ITEMS_RESPONSE_SCHEMA,
    },
  })

  const result = await model.generateContent(
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

  return result.response.text().trim()
}
