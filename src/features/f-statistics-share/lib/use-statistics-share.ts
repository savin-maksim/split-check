import { useState, useMemo, useEffect } from 'react'
import { toast } from 'react-hot-toast'

import { pluralize } from '@/shared/lib'

import { captureSections, collectShareSections } from './stat-share-sections'

type TUseStatisticsShareParams = {
  isOpen: boolean
  onClose: () => void
}

export const useStatisticsShare = ({ isOpen, onClose }: TUseStatisticsShareParams) => {
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set())

  const sections = useMemo(() => (isOpen ? collectShareSections() : []), [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setSelectedSections(new Set())
      return
    }

  }, [isOpen])

  const handleToggleSection = (index: number) => {
    setSelectedSections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedSections(new Set(sections.map((section) => section.index)))
  }

  const getSelectedSections = () => {
    const targets = sections.filter((section) => selectedSections.has(section.index))
    if (!targets.length) {
      toast.error('Выберите секции для экспорта')
      return []
    }

    return targets
  }

  const handleShare = async () => {
    const targets = getSelectedSections()
    if (!targets.length) return

    onClose()
    const images = await captureSections(targets)
    if (!images.length) return

    try {
      const files = images.map(
        (image) => new File([image.blob], image.filename, { type: 'image/png' }),
      )

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
    const targets = getSelectedSections()
    if (!targets.length) return

    onClose()
    const loadingToastId = toast.loading('Сохранение скриншотов…', { duration: Infinity })
    const images = await captureSections(targets)
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
    selectedSections,
    handleToggleSection,
    handleSelectAll,
    handleShare,
    handleSave,
  }
}
