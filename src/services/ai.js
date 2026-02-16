export const analyzeReceipt = async (file) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API ключ Gemini не найден. Проверьте настройки .env');
    }

    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });

    // Determine mime type from file
    const mimeType = file.type || 'image/jpeg';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Проанализируй этот чек. Извлеки список товаров с их названиями, количеством (по умолчанию 1, если не указано) и ценой за единицу. Верни JSON объект с ключом "items", содержащим массив объектов: { title: string, pricePerUnit: number, quantity: number }. Игнорируй итоговые суммы, налоги, даты и сервисные сборы. Все числа должны быть float. Если позиция имеет нулевую стоимость (0 или бесплатно), пропусти её и не включай в результат.'
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Ошибка при обращении к API');
    }

    const data = await response.json();
    
    // Parse the response from Gemini
    // Typically data.candidates[0].content.parts[0].text contains the JSON string
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error('Не удалось получить ответ от ИИ');
    }

    const content = JSON.parse(textContent);
    
    if (!content.items || !Array.isArray(content.items)) {
      throw new Error('Не удалось найти товары в чеке');
    }

    return content.items;
  } catch (error) {
    console.error('AI Error:', error);
    throw error;
  }
};
