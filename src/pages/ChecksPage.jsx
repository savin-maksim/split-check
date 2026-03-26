import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Receipt,
  Users,
  Calculator,
  FolderInput,
  Trash2,
  FilePlus,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { formatAmount } from '../utils/formatters'
import ActionButton from '../components/Button/ActionButton'
import PageSectionHeader from '../components/PageSectionHeader/PageSectionHeader'
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

const DISCARD_DRAFT_CONFIRM =
  'Начать новый чек? Текущие несохранённые данные в редакторе будут сброшены.'

function ChecksPage() {
  const navigate = useNavigate()
  const {
    people,
    costs,
    sessionMeta,
    startNewCheck,
    newCheckModalNonce,
    savedChecks,
    deleteSavedCheck,
  } = useApp()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState('')

  /** При ре-монте страницы nonce в контексте не сбрасывается — ref тоже должен стартовать с текущего nonce, иначе FAB снова «откроет» модалку. */
  const lastNewCheckNonce = useRef(newCheckModalNonce)

  const openCreateModal = useCallback(() => {
    setCreateTitle('')
    setIsCreateModalOpen(true)
  }, [])

  useEffect(() => {
    if (newCheckModalNonce > lastNewCheckNonce.current) {
      lastNewCheckNonce.current = newCheckModalNonce
      openCreateModal()
    }
  }, [newCheckModalNonce, openCreateModal])

  const handleDelete = (id, title) => {
    if (!window.confirm(`Удалить чек «${title}»?`)) return
    deleteSavedCheck(id)
    toast.success('Удалено')
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    const trimmed = createTitle.trim()
    if (!trimmed) {
      toast.error('Введите название')
      return
    }
    const hasDraft = people.length > 0 || costs.length > 0
    if (hasDraft && !window.confirm(DISCARD_DRAFT_CONFIRM)) {
      return
    }
    if (!startNewCheck(trimmed)) {
      toast.error('Введите название')
      return
    }
    setIsCreateModalOpen(false)
    navigate('/people')
  }

  return (
    <div className="checks-page">
      <div className="checks-page__container">
        <PageSectionHeader
          icon={<Receipt size={28} aria-hidden />}
          title="Чеки"
        />

        <section className="checks-page__section">
          {savedChecks.length === 0 ? (
            <div className="checks-page__empty-saved">
              <FolderInput size={40} aria-hidden />
              <p>
                Пока нет чеков — нажмите «Новый чек», задайте название и
                переходите к участникам.
              </p>
            </div>
          ) : (
            <ul className="checks-page__saved-list">
              {savedChecks.map((check) => {
                const sum = sumCosts(check.costs || [])
                const pCount = (check.people || []).length
                const cCount = (check.costs || []).length
                const isActive = sessionMeta?.id === check.id
                return (
                  <li key={check.id} className="checks-page__saved-list-item">
                    <Link
                      to={`/check/${check.id}`}
                      className={`checks-page__saved-card${isActive ? ' checks-page__saved-card--active' : ''}`}
                      onClick={(e) => {
                        if (sessionMeta?.id === check.id) {
                          e.preventDefault()
                          toast('Этот чек уже открыт')
                        }
                      }}
                    >
                      <div className="checks-page__saved-card-main">
                        <div className="checks-page__saved-card-header">
                          <h3 className="checks-page__saved-title">{check.title}</h3>
                          <button
                        type="button"
                        className="checks-page__icon-btn checks-page__icon-btn--delete"
                        onClick={() => handleDelete(check.id, check.title)}
                        title="Удалить чек"
                        aria-label="Удалить чек"
                      >
                        <Trash2 size={20} aria-hidden />
                      </button>
                        </div>
                        
                        <time
                          className="checks-page__saved-date"
                          dateTime={new Date(check.createdAt).toISOString()}
                        >
                          {formatSavedDate(check.createdAt)}
                        </time>
                        <div className="checks-page__current-meta checks-page__saved-card-meta">
                          <span className="checks-page__current-stat">
                            <Users size={18} aria-hidden />
                            {pCount} {pluralizeParticipants(pCount)}
                          </span>
                          <span className="checks-page__current-stat">
                            <Calculator size={18} aria-hidden />
                            {cCount} {pluralizePositions(cCount)}
                          </span>
                          <span className="checks-page__current-stat checks-page__current-stat--sum">
                            <Receipt size={18} aria-hidden />
                            {formatAmount(sum)} ₽
                          </span>
                          {check.paymentMode === 'single' && (
                            <span className="checks-page__saved-badge">
                              Один плательщик
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="checks-page__saved-actions">
                      
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <form onSubmit={handleCreateSubmit}>
          <h3 className="modal__title">Новый чек</h3>
          <p className="checks-page__create-lead">
            Задайте название — далее вы перейдёте к списку участников.
          </p>
          <div className="modal__inputs">
            <label className="modal__label" htmlFor="new-check-title">
              Название
            </label>
            <input
              id="new-check-title"
              className="modal__input"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="Например: Ужин в пятницу"
              autoComplete="off"
              autoFocus
            />
          </div>
          <div className="modal__buttons">
            <button
              type="button"
              className="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Отмена
            </button>
            <button type="submit" className="button">
              Далее: участники
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ChecksPage
