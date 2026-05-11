export const GEMINI_MODEL_INDEX_KEY = 'gemini_model_idx'

export const GEMINI_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
] as const

export type TGeminiModel = (typeof GEMINI_MODELS)[number]

export type TGeminiThinkingConfig = { thinkingBudget: number } | { thinkingLevel: 'minimal' | 'low' }

export type TGeminiGenerationConfig = {
  temperature: number
  thinkingConfig?: TGeminiThinkingConfig
}

export const GEMINI_GENERATION_CONFIGS: Record<TGeminiModel, TGeminiGenerationConfig> = {
  'gemini-3.1-flash-lite-preview': {
    temperature: 0.1,
    thinkingConfig: { thinkingLevel: 'minimal' },
  },
  'gemini-flash-lite-latest': {
    temperature: 0.1,
  },
  'gemini-2.5-flash-lite': {
    temperature: 0.1,
    thinkingConfig: { thinkingBudget: 0 },
  },
}

export const RECEIPT_ANALYZE_PROMPT =
  'Extract ALL the product lines from the receipt as shown in the photo: name, unit price, quantity. Do not combine identical lines and do not add duplicates — each line of the receipt is a separate element of the array, also check the number of items with non-zero price values to form the correct answer. Try to extract from the receipt NOT the full names, but only semantic ones, without codes, numbers and other garbage. Sometimes it happens that you split a position and set the wrong price for it. Think logically that a position cannot be named with just one adjective (this is an example) If liters or other units of measurement other than the number of pieces are specified for the product, specify 1 for the quantity.'
