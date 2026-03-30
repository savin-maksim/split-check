const MODELS = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-robotics-er-1.5-preview']

const STORAGE_KEY = 'gemini_model_state'

// Helper to get current index respecting day change
const getValidModelIndex = () => {
  try {
    const today = new Date().toDateString()
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      const { index, date } = JSON.parse(stored)
      // If saved date is today, return saved index
      if (date === today) {
        return index
      }
    }
    // If no data or different date, reset to 0
    return 0
  } catch (e) {
    console.warn('Error reading model state:', e)
    return 0
  }
}

// Helper to save index with current date
const saveModelIndex = (index) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        index,
        date: new Date().toDateString(),
      }),
    )
  } catch (e) {
    console.warn('Error saving model state:', e)
  }
}

let currentModelIndex = getValidModelIndex()

export const analyzeReceipt = async (file) => {
  // Sync index before starting (in case day changed while app was open)
  currentModelIndex = getValidModelIndex()

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('API ключ Gemini не найден. Проверьте настройки .env')
    }

    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = (error) => reject(error)
    })

    // Determine mime type from file
    const mimeType = file.type || 'image/jpeg'

    const currentModel = MODELS[currentModelIndex]
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Проанализируй этот чек. Извлеки список товаров с их названиями, количеством (по умолчанию 1, если не указано) и ценой за единицу. Верни JSON объект с ключом "items", содержащим массив объектов: { title: string, pricePerUnit: number, quantity: number }. Игнорируй итоговые суммы, налоги, даты и сервисные сборы. Все числа должны быть float. Если позиция имеет нулевую стоимость (0 или бесплатно), пропусти её и не включай в результат.',
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      },
    )

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('QUOTA_EXCEEDED')
      }
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Ошибка при обращении к API')
    }

    const data = await response.json()

    // Parse the response from Gemini
    // Typically data.candidates[0].content.parts[0].text contains the JSON string
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textContent) {
      throw new Error('Не удалось получить ответ от ИИ')
    }

    const content = JSON.parse(textContent)

    if (!content.items || !Array.isArray(content.items)) {
      throw new Error('Не удалось найти товары в чеке')
    }

    return content.items
  } catch (error) {
    console.error('AI Error:', error)

    if (
      error.message === 'QUOTA_EXCEEDED' ||
      error.message.includes('You exceeded your current quota') ||
      error.message.includes('Quota exceeded')
    ) {
      if (currentModelIndex < MODELS.length - 1) {
        currentModelIndex++
        // Save the new index and today's date
        saveModelIndex(currentModelIndex)
        throw new Error('Достигнут лимит модели, сейчас сменим на другую, пожалуйста попробуйте снова')
      }
    }

    throw error
  }
}
