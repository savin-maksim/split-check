import { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import { collectStatShareSections, captureAndExportStatShares } from '../../utils/shareStatisticsScreenshots'
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
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  const handleExport = async () => {
    if (selectedIndices.length === 0) return
    onClose()
    await captureAndExportStatShares(selectedIndices)
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

      <div className="modal__buttons">
        <Button onClick={onClose}>Отмена</Button>
        <Button className="button--active" onClick={handleExport} disabled={selectedIndices.length === 0}>
          Поделиться или скачать ({selectedIndices.length})
        </Button>
      </div>
    </Modal>
  )
}

export default StatisticsShareModal
