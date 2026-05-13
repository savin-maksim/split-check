export const GEMINI_MODEL_INDEX_KEY = 'gemini_model_idx'

export const GEMINI_MODELS = ['gemini-3.1-flash-lite-preview', 'gemini-2.5-flash-lite'] as const

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
  'gemini-2.5-flash-lite': {
    temperature: 0.1,
    thinkingConfig: { thinkingBudget: 1024 },
  },
}

export const RECEIPT_ANALYZE_PROMPT =
  'Extract all purchased items from the receipt.\n' +
  'For each item, return:\n' +
  '- name: a cleaned semantic product name\n' +
  '- unitPrice\n' +
  '- quantity\n' +
  'Rules for name:\n' +
  '- Keep the meaningful product name, slightly shortened.\n' +
  '- Preserve important identifying words such as product type, brand, flavor, variant, or other useful descriptors if they help distinguish the item.\n' +
  '- Remove garbage: item codes, store/internal identifiers, VAT/tax labels, percentages, bracketed technical fragments, barcodes, article numbers, random OCR noise, prices, quantities, and other non-product metadata.\n' +
  '- Do not over-shorten the name. Keep enough detail to distinguish similar products.\n' +
  '- Do not return names made of only one vague adjective or only a brand if the product type is clear.\n' +
  '- Normalize minor OCR differences: if two rows clearly refer to the same product, return the same cleaned name.\n' +
  'Rules for quantity:\n' +
  '- If the receipt clearly shows item count in pieces, use that count.\n' +
  '- If the item is sold by weight, liters, volume, or another measurement unit, set quantity = 1.\n' +
  '- If quantity is unclear, set quantity = 1.\n' +
  'Rules for unitPrice:\n' +
  '- Use numeric value only.\n' +
  '- If quantity > 1 and total is visible, unitPrice = total / quantity.\n' +
  '- Do not include zero-cost items.\n' +
  'Validation before final answer:\n' +
  '- Remove non-item rows such as totals, discounts, VAT/tax, payment info, and service lines.\n' +
  '- Make sure the same product gets the same cleaned name across the receipt.\n' +
  '- Make sure each name is clean, meaningful, and contains no extra garbage.'
