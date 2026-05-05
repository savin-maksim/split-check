import type { TReceiptAnalyzePhase } from './types'

export const GEMINI_MODEL_INDEX_KEY = 'gemini_model_idx'

export const RECEIPT_ANALYZE_PHASE_LABEL: Record<TReceiptAnalyzePhase, string> = {
  encoding: 'Готовим изображение',
  requesting: 'Отправляем запрос',
  streaming: 'Модель обрабатывает чек',
  parsing: 'Разбираем результат',
}

export const GEMINI_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-3-pro-image-preview',
] as const

export const RECEIPT_ANALYZE_PROMPT =
  'Извлеки позиции из чека. Верни JSON массив: [{"title":"...","price":число,"qty":число}]. Только JSON, без пояснений. Если встречаются позиции с одинаковым названием, суммируй их количество. Учитывай в чеке только количество, если там указаны литры или любые другие единицы, которые не относятся к количеству для позиции, пиши 1.'
