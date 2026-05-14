export const GEMINI_MODEL_INDEX_KEY = 'gemini_model_idx'

export const GEMINI_MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'] as const

export type TGeminiModel = (typeof GEMINI_MODELS)[number]

export type TGeminiThinkingConfig =
  | { thinkingBudget: number }
  | { thinkingLevel: 'minimal' | 'low' | 'medium' | 'high' }

export type TGeminiGenerationConfig = {
  temperature: number
  thinkingConfig?: TGeminiThinkingConfig
}

export const GEMINI_GENERATION_CONFIGS: Record<TGeminiModel, TGeminiGenerationConfig> = {
  'gemini-3.1-flash-lite': {
    temperature: 0.0,
    thinkingConfig: { thinkingLevel: 'minimal' },
  },
  'gemini-2.5-flash-lite': {
    temperature: 0.0,
    thinkingConfig: { thinkingBudget: 1024 },
  },
}

export const RECEIPT_ANALYZE_PROMPT =
  'Extract purchased receipt items.\n' +
  'For each item return:\n' +
  '- name\n' +
  '- quantity\n' +
  '- unitPrice\n' +
  '- totalPrice\n' +
  'Name:\n' +
  '- Return a cleaned semantic product name, slightly shortened (use the same language as the receipt item text).\n' +
  '- "name" must be a normalized product name, not the raw receipt line.\n' +
  '- Prefer stable normalized names over literal OCR text.\n' +
  '- Keep useful identifying words: product type, brand, flavor, variant, etc.\n' +
  '- Remove garbage: codes, VAT/tax labels, percentages, article numbers, bracketed fragments, prices, quantities, barcodes, and OCR noise.\n' +
  '- Do not over-shorten; keep enough detail to distinguish similar products.\n' +
  '- If two rows are clearly the same product but OCR differs slightly, return the same cleaned name.\n' +
  'Quantity:\n' +
  '- Use piece count if clearly shown.\n' +
  '- For weight, volume, package size, or other non-piece measurement units, use quantity = 1.\n' +
  '- If unclear, use quantity = 1.\n' +
  'Prices:\n' +
  '- unitPrice and totalPrice must be numeric only.\n' +
  '- totalPrice is the final price for this receipt row after quantity is applied.\n' +
  '- If quantity = 1, unitPrice usually equals totalPrice.\n' +
  '- If quantity > 1 and totalPrice is visible, calculate unitPrice = totalPrice / quantity.\n' +
  '- If unitPrice and quantity are visible but totalPrice is not, calculate totalPrice = unitPrice * quantity.\n' +
  '- Do not include currency symbols.\n' +
  'Exclude zero-cost items, totals, discounts, VAT/tax rows, payment info, and service lines.'
