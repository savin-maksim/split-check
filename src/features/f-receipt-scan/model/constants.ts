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
    temperature: 0.0,
    thinkingConfig: { thinkingLevel: 'minimal' },
  },
  'gemini-flash-lite-latest': {
    temperature: 0.4,
  },
  'gemini-2.5-flash-lite': {
    temperature: 0.4,
    thinkingConfig: { thinkingBudget: 0 },
  },
}

export const RECEIPT_ANALYZE_PROMPT =
  'Extract the items from the receipt: the name (without numbers and unnecessary garbage, just the semantic name), the unit price and quantity. Do not add zero-cost items. Try NOT to extract full names from the receipt, but only semantic ones, without codes, numbers, VAT and other garbage, because then I use a function that collects the same item names and puts them in one position. Sometimes it happens that you split a position and set the wrong price for it. Think logically that a position cannot be named with just one adjective (this is an example). If liters or other units of measurement other than the number of pieces are specified for the product, specify 1 for the quantity.'
