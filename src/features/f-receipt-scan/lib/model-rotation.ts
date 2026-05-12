import { GEMINI_MODEL_INDEX_KEY, GEMINI_MODELS } from '../model'

const getStoredModelIndex = (): number => {
  const idx = parseInt(localStorage.getItem(GEMINI_MODEL_INDEX_KEY) ?? '0', 10)
  if (!Number.isFinite(idx)) return 0
  return ((idx % GEMINI_MODELS.length) + GEMINI_MODELS.length) % GEMINI_MODELS.length
}

export const getCurrentModel = (): string => {
  try {
    return GEMINI_MODELS[getStoredModelIndex()]!
  } catch {
    return GEMINI_MODELS[0]!
  }
}

export const advanceModel = (): string => {
  try {
    const nextIdx = (getStoredModelIndex() + 1) % GEMINI_MODELS.length
    localStorage.setItem(GEMINI_MODEL_INDEX_KEY, String(nextIdx))
    return GEMINI_MODELS[nextIdx]!
  } catch {
    return GEMINI_MODELS[0]!
  }
}

export const buildModelRotationOrder = (firstModel: string): string[] => [
  firstModel,
  ...GEMINI_MODELS.filter((m) => m !== firstModel),
]
