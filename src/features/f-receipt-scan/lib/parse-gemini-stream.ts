export type TGeminiStreamHandlers = {
  onThoughtDelta?: (delta: string) => void
  signal?: AbortSignal
}

type TGeminiStreamChunk = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> }
  }>
}

export const accumulateAnswerFromGeminiStream = async (
  body: ReadableStream<Uint8Array>,
  handlers: TGeminiStreamHandlers,
): Promise<string> => {
  const { onThoughtDelta, signal } = handlers
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let answerText = ''

  const processLine = (line: string) => {
    const trimmed = line.trim()
    if (!trimmed) return

    let payload: string
    if (trimmed.startsWith('data:')) {
      payload = trimmed.slice(5).trim()
    } else if (trimmed.startsWith('{')) {
      payload = trimmed
    } else {
      return
    }

    if (payload === '' || payload === '[DONE]') return
    try {
      const chunk = JSON.parse(payload) as TGeminiStreamChunk
      const parts = chunk?.candidates?.[0]?.content?.parts
      if (!parts?.length) return
      for (const part of parts) {
        const t = part.text
        if (typeof t !== 'string' || !t) continue
        if (part.thought === true) {
          onThoughtDelta?.(t)
        } else {
          answerText += t
        }
      }
    } catch {
      // malformed JSON chunk — skip line
    }
  }

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let idx: number
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 1)
        processLine(line)
      }
    }

    if (buffer.trim()) {
      processLine(buffer)
    }
  } finally {
    reader.releaseLock()
  }

  return answerText
}
