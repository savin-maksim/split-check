export const GEMINI_MODEL_INDEX_KEY = 'gemini_model_idx'

export const GEMINI_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-pro-preview-customtools',
] as const

export const RECEIPT_ANALYZE_PROMPT = 'Extract ALL the lines of items from the receipt as in the photo: name, unit price, quantity. Do not combine identical rows and do not add duplicates — each row of the receipt is a separate element of the array, also check the number of positions at non-zero price values to form the correct answer. Try to extract the full names from the receipt. Sometimes it happens that you split a position and give it the wrong price. Think logically that a position cant just be called by one adjective (this is an example) If liters or other units are specified for an item other than the number of pieces, specify 1 for qty.'
