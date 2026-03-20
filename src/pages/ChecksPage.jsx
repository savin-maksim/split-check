import { useMemo, useState } from 'react'
import {
  Receipt,
  Users,
  Calculator,
  Save,
  FolderInput,
  Trash2,
  Import,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { StorageService } from '../services/storage'
import { formatAmount } from '../utils/formatters'
import ActionButton from '../components/Button/ActionButton'
import Modal from '../components/Modal/Modal'
import './checks-page.scss'

function formatSavedDate(ts) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(ts)
}

function pluralizePositions(n) {
  const n100 = n % 100
  if (n100 >= 11 && n100 <= 14) return 'позиций'
  const n10 = n % 10
  if (n10 === 1) return 'позиция'
  if (n10 >= 2 && n10 <= 4) return 'позиции'
  return 'позиций'
}

function pluralizeParticipants(n) {
  const n100 = n % 100
  if (n100 >= 11 && n100 <= 14) return 'участников'
  const n10 = n % 10
  if (n10 === 1) return 'участник'
  if (n10 >= 2 && n10 <= 4) return 'участника'
  return 'участников'
}

function sumCosts(costs) {
  return costs.reduce((s, c) => s + (Number(c.amount) || 0), 0)
}

function ChecksPage() {
  const {
    people,
    costs,
    paymentMode,
    singlePayer,
    applySessionSnapshot,
  } = useApp()

  const [savedChecks, setSavedChecks] = useState(() =>
    StorageService.getSavedChecks()
  )
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')

  const totalAmount = useMemo(() => sumCosts(costs), [costs])
  const canSave = people.length > 0

  const openSaveModal = () => {
    setSaveTitle(
      `Чек от ${new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`
    )
    setIsSaveModalOpen(true)
  }

  const handleSaveSubmit = (e) => {
    e.preventDefault()
    const trimmed = saveTitle.trim()
    if (!trimmed) {
      toast.error('Введите название')
      return
    }
    if (!canSave) {
      toast.error('Добавьте хотя бы одного участника')
      return
    }

    const snapshot = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `check-${Date.now()}`,
      title: trimmed,
      createdAt: Date.now(),
      people: JSON.parse(JSON.stringify(people)),
      costs: JSON.parse(JSON.stringify(costs)),
      paymentMode,
      singlePayer: singlePayer ? JSON.parse(JSON.stringify(singlePayer)) : null,
    }

    const next = [snapshot, ...StorageService.getSavedChecks()]
    StorageService.setSavedChecks(next)
    setSavedChecks(next)
    setIsSaveModalOpen(false)
    toast.success('Чек сохранён')
  }

  const confirmLoad = (check) => {
    const hasDraft = people.length > 0 || costs.length > 0
    if (
      hasDraft &&
      !window.confirm(
        'Загрузить сохранённый чек? Текущие несохранённые данные в редакторе будут заменены.'
      )
    ) {
      return
    }
    applySessionSnapshot(check)
    toast.success(`Загружено: ${check.title}`)
  }

  const handleDelete = (id, title) => {
    if (!window.confirm(`Удалить «${title}» из сохранённых?`)) return
    const next = StorageService.getSavedChecks().filter((c) => c.id !== id)
    StorageService.setSavedChecks(next)
    setSavedChecks(next)
    toast.success('Удалено')
  }

  return (
    <div className="checks-page">
      <div className="checks-page__container">
        <header className="checks-page__header">
          <div className="checks-page__title-block">
            <Receipt
              className="checks-page__title-icon"
              size={28}
              aria-hidden
            />
            <div>
              <h1 className="checks-page__title">Чеки</h1>
              <p className="checks-page__subtitle">
                Сохраняйте сессию целиком и открывайте позже
              </p>
            </div>
          </div>
        </header>

        <section className="checks-page__section" aria-labelledby="current-heading">
          <h2 id="current-heading" className="checks-page__section-title">
            Текущий чек
          </h2>
          <div className="checks-page__current-card">
            <div className="checks-page__current-meta">
              <span className="checks-page__current-stat">
                <Users size={18} aria-hidden />
                {people.length}{' '}
                {pluralizeParticipants(people.length)}
              </span>
              <span className="checks-page__current-stat">
                <Calculator size={18} aria-hidden />
                {costs.length} {pluralizePositions(costs.length)}
              </span>
              <span className="checks-page__current-stat checks-page__current-stat--sum">
                <Receipt size={18} aria-hidden />
                {formatAmount(totalAmount)} ₽
              </span>
            </div>
            <p className="checks-page__hint">
              Данные с разделов{' '}
              <Link to="/people">Участники</Link>,{' '}
              <Link to="/costs">Расходы</Link> и расчёт на{' '}
              <Link to="/stats">Статистика</Link> попадают в один сохранённый
              снимок.
            </p>
            <ActionButton
              icon={<Save size={18} />}
              onClick={openSaveModal}
              disabled={!canSave}
              className="checks-page__save-btn"
            >
              Сохранить в список
            </ActionButton>
            {!canSave && (
              <p className="checks-page__save-hint">
                Чтобы сохранить, добавьте участников на странице «Участники».
              </p>
            )}
          </div>
        </section>

        <section className="checks-page__section" aria-labelledby="saved-heading">
          <h2 id="saved-heading" className="checks-page__section-title">
            Сохранённые чеки
          </h2>
          {savedChecks.length === 0 ? (
            <div className="checks-page__empty-saved">
              <FolderInput size={40} aria-hidden />
              <p>Пока нет сохранённых чеков — заполните участников и расходы и
                нажмите «Сохранить в список».</p>
            </div>
          ) : (
            <ul className="checks-page__saved-list">
              {savedChecks.map((check) => {
                const sum = sumCosts(check.costs || [])
                const pCount = (check.people || []).length
                const cCount = (check.costs || []).length
                return (
                  <li key={check.id} className="checks-page__saved-card">
                    <div className="checks-page__saved-card-main">
                      <h3 className="checks-page__saved-title">{check.title}</h3>
                      <time
                        className="checks-page__saved-date"
                        dateTime={new Date(check.createdAt).toISOString()}
                      >
                        {formatSavedDate(check.createdAt)}
                      </time>
                      <div className="checks-page__saved-meta">
                        <span>
                          {pCount} {pluralizeParticipants(pCount)}
                        </span>
                        <span>
                          {cCount} {pluralizePositions(cCount)}
                        </span>
                        <span className="checks-page__saved-sum">
                          {formatAmount(sum)} ₽
                        </span>
                        {check.paymentMode === 'single' && (
                          <span className="checks-page__saved-badge">
                            Один плательщик
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="checks-page__saved-actions">
                      <button
                        type="button"
                        className="checks-page__icon-btn checks-page__icon-btn--load"
                        onClick={() => confirmLoad(check)}
                        title="Загрузить в редактор"
                      >
                        <Import size={20} aria-hidden />
                        <span>Загрузить</span>
                      </button>
                      <button
                        type="button"
                        className="checks-page__icon-btn checks-page__icon-btn--delete"
                        onClick={() => handleDelete(check.id, check.title)}
                        title="Удалить из списка"
                        aria-label="Удалить из списка"
                      >
                        <Trash2 size={20} aria-hidden />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
        <form onSubmit={handleSaveSubmit}>
          <h3 className="modal__title">Сохранить чек</h3>
          <div className="modal__inputs">
            <label className="modal__label" htmlFor="check-title">
              Название
            </label>
            <input
              id="check-title"
              className="modal__input"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Например: Ужин в пятницу"
              autoComplete="off"
            />
          </div>
          <div className="modal__buttons">
            <button
              type="button"
              className="button"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Отмена
            </button>
            <button type="submit" className="button">
              Сохранить
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ChecksPage
