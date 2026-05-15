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
    thinkingConfig: { thinkingBudget: 5000 },
  },
}
