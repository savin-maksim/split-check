import { toast } from 'react-hot-toast'
import { toBlob } from 'html-to-image'

export type TShareSection = {
  index: number
  element: HTMLElement
  title: string
}

export type TCapturedImage = {
  blob: Blob
  filename: string
}

const sectionTitleByType: Record<string, string> = {
  summary: 'Общая сумма',
  person: 'Участник',
  transfers: 'Переводы',
}

const getCaptureOptions = () => ({
  cacheBust: true,
  backgroundColor: 'radial-gradient(ellipse at center, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0) 70%)',
  style: {
    margin: '0',
  },
})

const getSectionTitle = (element: HTMLElement, index: number): string => {
  const label = element.dataset.statShareLabel?.trim()
  if (label) return label

  const type = element.dataset.statShare?.trim()
  if (type && sectionTitleByType[type]) return sectionTitleByType[type]

  return `Секция ${index + 1}`
}

export const collectShareSections = (): TShareSection[] =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-stat-share]')).map((element, index) => ({
    index,
    element,
    title: getSectionTitle(element, index),
  }))

export const captureSections = async (sections: TShareSection[]): Promise<TCapturedImage[]> => {
  const images: TCapturedImage[] = []
  const options = getCaptureOptions()

  for (const section of sections) {
    if (!section.element.isConnected) {
      toast.error(`Секция недоступна: ${section.title}`)
      continue
    }

    try {
      const blob = await toBlob(section.element, options)
      if (!blob) {
        toast.error(`Не удалось создать изображение: ${section.title}`)
        continue
      }
      images.push({ blob, filename: `${section.title}.png` })
    } catch {
      toast.error(`Не удалось создать изображение: ${section.title}`)
    }
  }

  return images
}
