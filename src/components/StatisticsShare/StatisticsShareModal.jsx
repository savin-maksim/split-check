import { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import {
  collectStatShareSections,
  shareStatShareScreenshots,
  saveStatShareScreenshots,
} from '../../utils/shareStatisticsScreenshots'
import '../ReceiptScanner/scanner.scss'

function StatisticsShareModal({ isOpen, onClose }) {
  const [sections, setSections] = useState([])
  const [selectedIndices, setSelectedIndices] = useState([])

  useEffect(() => {
    if (!isOpen) return
    const list = collectStatShareSections()
    setSections(list)
    setSelectedIndices(list.map((s) => s.index))
  }, [isOpen])

  const toggleSection = (index) => {
    setSelectedIndices((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleShare = async () => {
    if (selectedIndices.length === 0) return
    const indices = [...selectedIndices]
    onClose()
    await shareStatShareScreenshots(indices)
  }

  const handleSave = async () => {
    if (selectedIndices.length === 0) return
    const indices = [...selectedIndices]
    onClose()
    await saveStatShareScreenshots(indices)
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">Скриншоты статистики</h2>

      <div className="scanner__preview-list">
        {sections.length === 0 ? (
          <p className="modal__message">Нет секций — откройте страницу статистики с данными</p>
        ) : (
          sections.map(({ index, title }) => {
            const isSelected = selectedIndices.includes(index)
            return (
              <div
                key={index}
                className={`scanner__item scanner__item--card ${isSelected ? 'scanner__item--selected' : ''}`}
                onClick={() => toggleSection(index)}
              >
                <span className="scanner__item-title">{title}</span>
              </div>
            )
          })
        )}
      </div>

      <div className="scanner__summary">
        Выбрано: <strong className="scanner__summary--total">{selectedIndices.length}</strong> из {sections.length}
      </div>

      <div className="modal__buttons modal__buttons--triple">
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="active" onClick={handleShare} disabled={selectedIndices.length === 0}>
          Поделиться
        </Button>
        <Button onClick={handleSave} disabled={selectedIndices.length === 0}>
          Сохранить
        </Button>
      </div>
    </Modal>
  )
}

export default StatisticsShareModal
