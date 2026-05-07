import { GEMINI_MODEL_INDEX_KEY, GEMINI_MODELS } from '../model'

/** Возвращает следующую модель из ротации и инкрементирует курсор в localStorage. */
export const getNextModel = (): string => {
  try {
    const idx = parseInt(localStorage.getItem(GEMINI_MODEL_INDEX_KEY) ?? '0', 10)
    const model = GEMINI_MODELS[idx % GEMINI_MODELS.length]!
    localStorage.setItem(GEMINI_MODEL_INDEX_KEY, String((idx + 1) % GEMINI_MODELS.length))
    return model
  } catch {
    return GEMINI_MODELS[0]!
  }
}

export const buildModelRotationOrder = (firstModel: string): string[] => [
  firstModel,
  ...GEMINI_MODELS.filter((m) => m !== firstModel),
]
