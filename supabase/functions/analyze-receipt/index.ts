/* global Deno */

import { GoogleGenerativeAI, SchemaType } from 'npm:@google/generative-ai@0.24.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const receiptItemsResponseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING },
      quantity: { type: SchemaType.NUMBER },
      unitPrice: { type: SchemaType.NUMBER },
      totalPrice: { type: SchemaType.NUMBER },
    },
    required: ['name', 'quantity', 'unitPrice', 'totalPrice'],
  },
}

const receiptAnalyzePrompt =
  'Extract purchased receipt items.\n' +
  '\n' +
  'For each item return:\n' +
  '- name\n' +
  '- quantity\n' +
  '- unitPrice\n' +
  '- totalPrice\n' +
  '\n' +
  'Name:\n' +
  '- Return a cleaned semantic product name, slightly shortened.\n' +
  '- "name" must be a normalized product name, not the raw receipt line.\n' +
  '- Prefer stable normalized names over literal OCR text.\n' +
  '- Keep useful identifying words: product type, brand, flavor, variant, etc.\n' +
  '- Remove garbage: codes, VAT/tax labels, percentages, article numbers, bracketed fragments, prices, quantities, barcodes, and OCR noise.\n' +
  '- Do not over-shorten; keep enough detail to distinguish similar products.\n' +
  '- If two rows are clearly the same product but OCR differs slightly, return the same cleaned name.\n' +
  '\n' +
  'Quantity:\n' +
  '- Use piece count if clearly shown.\n' +
  '- For weight, volume, package size, or other non-piece measurement units, use quantity = 1.\n' +
  '- If unclear, use quantity = 1.\n' +
  '\n' +
  'Prices:\n' +
  '- unitPrice and totalPrice must be numeric only.\n' +
  '- totalPrice is the final price for this receipt row after quantity is applied.\n' +
  '- If quantity = 1, unitPrice usually equals totalPrice.\n' +
  '- If quantity > 1 and totalPrice is visible, calculate unitPrice = totalPrice / quantity.\n' +
  '- If unitPrice and quantity are visible but totalPrice is not, calculate totalPrice = unitPrice * quantity.\n' +
  '- Do not include currency symbols.\n' +
  '\n' +
  'Exclude zero-cost items, totals, discounts, VAT/tax rows, payment info, and service lines.'

type TAnalyzeReceiptRequest = {
  modelName?: unknown
  base64?: unknown
  mimeType?: unknown
  generationConfig?: unknown
}

type TThinkingConfig = {
  thinkingBudget?: number
  thinkingLevel?: 'minimal' | 'low'
}

type TGenerationConfig = {
  temperature?: number
  thinkingConfig?: TThinkingConfig
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })

const getErrorStatus = (error: unknown): number => {
  const status = (error as { status?: unknown })?.status
  return typeof status === 'number' ? status : 500
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message.replace(/^\[GoogleGenerativeAI Error\]: /, '')
  }
  return 'Receipt recognition failed'
}

const parseThinkingConfig = (value: unknown): TThinkingConfig | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const { thinkingBudget, thinkingLevel } = value as Record<string, unknown>
  if (typeof thinkingBudget === 'number' && Number.isFinite(thinkingBudget)) {
    return { thinkingBudget }
  }
  if (thinkingLevel === 'minimal' || thinkingLevel === 'low') {
    return { thinkingLevel }
  }

  return undefined
}

const parseGenerationConfig = (value: unknown): TGenerationConfig => {
  if (!value || typeof value !== 'object') {
    return { temperature: 0.0 }
  }

  const { temperature, thinkingConfig } = value as Record<string, unknown>

  return {
    temperature: typeof temperature === 'number' && Number.isFinite(temperature) ? temperature : 0.0,
    thinkingConfig: parseThinkingConfig(thinkingConfig),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ message: 'Method not allowed' }, 405)
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return jsonResponse({ message: 'GEMINI_API_KEY is not configured' }, 500)
  }

  let payload: TAnalyzeReceiptRequest
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ message: 'Invalid JSON body' }, 400)
  }

  const { modelName, base64, mimeType, generationConfig } = payload
  if (typeof modelName !== 'string' || typeof base64 !== 'string' || typeof mimeType !== 'string') {
    return jsonResponse({ message: 'modelName, base64 and mimeType are required' }, 400)
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: receiptItemsResponseSchema,
        ...parseGenerationConfig(generationConfig),
      },
    })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: receiptAnalyzePrompt }, { inlineData: { mimeType, data: base64 } }],
        },
      ],
    })

    return jsonResponse({ text: result.response.text().trim() })
  } catch (error) {
    return jsonResponse({ message: getErrorMessage(error) }, getErrorStatus(error))
  }
})
