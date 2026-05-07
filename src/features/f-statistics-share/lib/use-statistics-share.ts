import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { pluralize } from '@/shared/lib'

import { useStatShareContext } from '../model'
import type { TStatShareTarget } from '../model'
import { captureTargets } from './capture-sections'

type TUseStatisticsShareParams = {
  isOpen: boolean
  onClose: () => void
}

export const useStatisticsShare = ({ isOpen, onClose }: TUseStatisticsShareParams) => {
  const ctx = useStatShareContext()
  const [sections, setSections] = useState<TStatShareTarget[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isOpen) {
      setSections([])
      setSelectedIds(new Set())
      return
    }
    setSections(ctx?.list() ?? [])
  }, [isOpen, ctx])

  const handleToggleSection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedIds(new Set(sections.map((section) => section.id)))
  }

  const getSelectedTargets = (): TStatShareTarget[] => {
    const targets = sections.filter((section) => selectedIds.has(section.id))
    if (!targets.length) {
      toast.error('Выберите секции для экспорта')
      return []
    }
    return targets
  }

  const handleShare = async () => {
    const targets = getSelectedTargets()
    if (!targets.length) return

    onClose()
    const images = await captureTargets(targets)
    if (!images.length) return

    try {
      const files = images.map((image) => new File([image.blob], image.filename, { type: 'image/png' }))

      if (navigator.canShare?.({ files })) {
        await navigator.share({ files, title: 'Статистика чека' })
      } else {
        toast.error('Шаринг не поддерживается')
      }
    } catch {
      toast.error('Ошибка при отправке')
    }
  }

  const handleSave = async () => {
    const targets = getSelectedTargets()
    if (!targets.length) return

    onClose()
    const loadingToastId = toast.loading('Сохранение скриншотов…', { duration: Infinity })
    const images = await captureTargets(targets)
    toast.dismiss(loadingToastId)
    if (!images.length) return

    for (const image of images) {
      const url = URL.createObjectURL(image.blob)
      try {
        const link = document.createElement('a')
        link.download = image.filename
        link.href = url
        link.click()
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    toast.success(
      `${images.length} ${pluralize(images.length, ['изображение', 'изображения', 'изображений'])} ${pluralize(images.length, ['сохранено', 'сохранены', 'сохранено'])}`,
    )
  }

  return {
    sections,
    selectedIds,
    handleToggleSection,
    handleSelectAll,
    handleShare,
    handleSave,
  }
}
