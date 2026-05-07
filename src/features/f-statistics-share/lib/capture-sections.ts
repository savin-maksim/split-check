import { toast } from 'react-hot-toast'
import { toBlob } from 'html-to-image'

import type { TStatShareTarget } from '../model'

export type TCapturedImage = {
  blob: Blob
  filename: string
}

const CAPTURE_OPTIONS = {
  cacheBust: true,
  backgroundColor: 'radial-gradient(ellipse at center, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0) 70%)',
  style: { margin: '0' },
}

export const captureTargets = async (targets: TStatShareTarget[]): Promise<TCapturedImage[]> => {
  const images: TCapturedImage[] = []

  for (const target of targets) {
    const element = target.ref.current
    if (!element || !element.isConnected) {
      toast.error(`Секция недоступна: ${target.label}`)
      continue
    }

    try {
      const blob = await toBlob(element, CAPTURE_OPTIONS)
      if (!blob) {
        toast.error(`Не удалось создать изображение: ${target.label}`)
        continue
      }
      images.push({ blob, filename: `${target.label}.png` })
    } catch {
      toast.error(`Не удалось создать изображение: ${target.label}`)
    }
  }

  return images
}
