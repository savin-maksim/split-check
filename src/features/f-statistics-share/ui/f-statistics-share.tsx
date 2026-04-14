import { useState, useCallback, useMemo } from 'react'

import { Share2, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { toPng } from 'html-to-image'

import { Modal, Button, EButtonVariant } from '@/shared/ui'

import './f-statistics-share.scss'

type TFStatisticsShareProps = {
  isOpen: boolean
  onClose: () => void
}

const collectShareSections = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-stat-share]'))
}

export const FStatisticsShare = ({ isOpen, onClose }: TFStatisticsShareProps) => {
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set())

  const sections = useMemo(() => (isOpen ? collectShareSections() : []), [isOpen])

  const handleToggleSection = (idx: number) => {
    setSelectedSections((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedSections(new Set(sections.map((_, i) => i)))
  }

  const captureSelected = useCallback(async () => {
    const targets = sections.filter((_, i) => selectedSections.has(i))
    if (!targets.length) {
      toast.error('Выберите секции для экспорта')
      return
    }

    const images: string[] = []
    for (const el of targets) {
      try {
        const dataUrl = await toPng(el, { backgroundColor: '#1f1f1f' })
        images.push(dataUrl)
      } catch {
        toast.error('Ошибка при создании изображения')
      }
    }
    return images
  }, [sections, selectedSections])

  const handleShare = async () => {
    const images = await captureSelected()
    if (!images?.length) return

    try {
      const blobs = await Promise.all(
        images.map(async (dataUrl) => {
          const resp = await fetch(dataUrl)
          return resp.blob()
        }),
      )
      const files = blobs.map((blob, i) => new File([blob], `stats-${i + 1}.png`, { type: 'image/png' }))

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
    const images = await captureSelected()
    if (!images?.length) return

    for (const [i, dataUrl] of images.entries()) {
      const link = document.createElement('a')
      link.download = `stats-${i + 1}.png`
      link.href = dataUrl
      link.click()
    }
    toast.success('Изображения сохранены')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="modal__title">Поделиться статистикой</h3>
      <div className="modal__inputs">
        {sections.length === 0 ? (
          <p className="modal__message">Нет секций для экспорта</p>
        ) : (
          <div className="f-statistics-share__sections">
            {sections.map((el, idx) => (
              <button
                key={idx}
                type="button"
                className={`f-statistics-share__section ${selectedSections.has(idx) ? 'f-statistics-share__section--active' : ''}`}
                onClick={() => handleToggleSection(idx)}
              >
                {el.getAttribute('data-stat-share') || `Секция ${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="modal__buttons modal__buttons--triple">
        <Button onClick={handleSelectAll}>Выбрать все</Button>
        <Button
          variant={EButtonVariant.Active}
          onClick={handleShare}
          disabled={selectedSections.size === 0}
          icon={<Share2 size={16} />}
        >
          Поделиться
        </Button>
        <Button onClick={handleSave} disabled={selectedSections.size === 0} icon={<Download size={16} />}>
          Сохранить
        </Button>
      </div>
    </Modal>
  )
}
