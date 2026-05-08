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
      title: { type: SchemaType.STRING },
      price: { type: SchemaType.NUMBER },
      qty: { type: SchemaType.NUMBER },
    },
    required: ['title', 'price', 'qty'],
  },
}

const receiptAnalyzePrompt =
  'Extract ALL the lines of items from the receipt as in the photo: name, unit price, quantity. Do not combine identical rows and do not add duplicates - each row of the receipt is a separate element of the array, also check the number of positions at non-zero price values to form the correct answer. Try to extract the full names from the receipt. Sometimes it happens that you split a position and give it the wrong price. Think logically that a position cant just be called by one adjective (this is an example) If liters or other units are specified for an item other than the number of pieces, specify 1 for qty.'

type TAnalyzeReceiptRequest = {
  modelName?: unknown
  base64?: unknown
  mimeType?: unknown
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

  const { modelName, base64, mimeType } = payload
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
      },
    })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: receiptAnalyzePrompt },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
    })

    return jsonResponse({ text: result.response.text().trim() })
  } catch (error) {
    return jsonResponse({ message: getErrorMessage(error) }, getErrorStatus(error))
  }
})
