import { Share2, Download } from 'lucide-react'

import { cn } from '@/shared/lib'
import { Modal, Button, EButtonVariant } from '@/shared/ui'

import { useStatisticsShare } from '../lib'

import './f-statistics-share.scss'

type TFStatisticsShareProps = {
  isOpen: boolean
  onClose: () => void
}

export const FStatisticsShare = ({ isOpen, onClose }: TFStatisticsShareProps) => {
  const { sections, selectedSections, handleToggleSection, handleSelectAll, handleShare, handleSave } =
    useStatisticsShare({ isOpen, onClose })

  return (
    <Modal isOpen={isOpen} onClose={onClose} mode="top-0">
      <h3 className="modal__title">{sections.length === 0 ? 'Нет секций для экспорта' : 'Поделиться статистикой'}</h3>
      <div className="modal__inputs">
        {sections.length > 0 && (
          <div className="f-statistics-share__sections">
            {sections.map((section) => (
              <button
                key={section.index}
                type="button"
                className={cn(
                  'f-statistics-share__section',
                  selectedSections.has(section.index) && 'f-statistics-share__section--active',
                )}
                aria-pressed={selectedSections.has(section.index)}
                onClick={() => handleToggleSection(section.index)}
              >
                {section.title}
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
          icon={<Share2 size={'var(--button-icon-size)'} />}
        >
          Поделиться
        </Button>
        <Button
          onClick={handleSave}
          disabled={selectedSections.size === 0}
          icon={<Download size={'var(--button-icon-size)'} />}
        >
          Сохранить
        </Button>
      </div>
    </Modal>
  )
}
