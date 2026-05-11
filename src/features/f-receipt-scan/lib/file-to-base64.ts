const MAX_IMAGE_SIDE = 1600
const JPEG_QUALITY = 0.35

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Не удалось прочитать файл'))
        return
      }
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

const getResizedDimensions = (width: number, height: number) => {
  const longestSide = Math.max(width, height)
  if (longestSide <= MAX_IMAGE_SIDE) {
    return { width, height }
  }

  const scale = MAX_IMAGE_SIDE / longestSide
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

const canvasToBase64 = (canvas: HTMLCanvasElement): string =>
  canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1] ?? ''

export const fileToBase64 = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file).then((dataUrl) => dataUrl.split(',')[1] ?? '')
  }

  const dataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(dataUrl)
  const { width, height } = getResizedDimensions(image.naturalWidth, image.naturalHeight)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return dataUrl.split(',')[1] ?? ''
  }

  ctx.drawImage(image, 0, 0, width, height)
  return canvasToBase64(canvas)
}
