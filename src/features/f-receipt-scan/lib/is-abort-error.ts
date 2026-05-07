import { GoogleGenerativeAIAbortError } from '@google/generative-ai'

export const isAbortError = (e: unknown): boolean => {
  if (e instanceof DOMException && e.name === 'AbortError') return true
  if (e instanceof GoogleGenerativeAIAbortError) return true
  return e instanceof Error && e.name === 'AbortError'
}
