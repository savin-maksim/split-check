import { useState, useEffect, useRef, useCallback } from 'react'
import { Receipt, Users, Calculator, FolderInput, Trash2, Pencil } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useApp } from '@/context/AppContext'
import IconButton from '@/components/Button/IconButton'
import { formatAmount } from '@/utils/formatters'
import PageSectionHeader from '@/components/PageSectionHeader/PageSectionHeader'
import Modal from '@/components/Modal/Modal'
import MarqueeTitle from '@/components/MarqueeTitle/MarqueeTitle'
import Button from '@/components/Button/Button'
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
  const navigate = useNavigate()
  const {
    sessionMeta,
    startNewCheck,
    newCheckModalNonce,
    savedChecks,
    deleteSavedCheck,
    updateSavedCheckTitle,
  } = useApp()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState('')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editCheckId, setEditCheckId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const [checkToDelete, setCheckToDelete] = useState(null)

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

  const confirmDeleteCheck = () => {
    if (!checkToDelete) return
    deleteSavedCheck(checkToDelete.id)
    toast.success('Удалено')
    setCheckToDelete(null)
  }

  const handleEdit = (check) => {
    setEditCheckId(check.id)
    setEditTitle(check.title)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    const trimmed = editTitle.trim()
    if (!trimmed) {
      toast.error('Введите название')
      return
    }
    updateSavedCheckTitle(editCheckId, trimmed)
    setIsEditModalOpen(false)
    toast.success('Название обновлено')
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    const trimmed = createTitle.trim()
    if (!trimmed) {
      toast.error('Введите название')
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
        <PageSectionHeader icon={<Receipt size={40} aria-hidden />} title="Чеки" />

        <section className="checks-page__section">
          {savedChecks.length === 0 ? (
            <div className="checks-page__empty-saved">
              <FolderInput size={40} aria-hidden />
              <p>Пока нет чеков — нажмите «Новый чек», задайте название и переходите к участникам.</p>
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
                          <MarqueeTitle as="h3">{check.title}</MarqueeTitle>
                          <div className="checks-page__saved-header-actions">
                            <IconButton
                              icon={<Pencil aria-hidden />}
                              title="Редактировать чек"
                              aria-label="Редактировать чек"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleEdit(check)
                              }}
                            />
                            <IconButton
                              variant="danger"
                              icon={<Trash2 aria-hidden />}
                              title="Удалить чек"
                              aria-label="Удалить чек"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setCheckToDelete({ id: check.id, title: check.title })
                              }}
                            />
                          </div>
                        </div>

                        <time className="checks-page__saved-date" dateTime={new Date(check.createdAt).toISOString()}>
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
                            <span className="checks-page__saved-badge">Один плательщик</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <h3 className="modal__title">Новый чек</h3>
        <form
          className="modal__inputs"
          onSubmit={(e) => {
            e.preventDefault()
            handleCreateSubmit(e)
          }}
        >
          <input
            type="text"
            className="modal__input"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            placeholder="Например: Ужин в пятницу"
            autoComplete="off"
            autoFocus
          />
          <div className="modal__buttons">
            <Button onClick={() => setIsCreateModalOpen(false)}>Отмена</Button>
            <Button type="submit" className="button--active">
              Создать
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={checkToDelete != null} onClose={() => setCheckToDelete(null)}>
        <h3 className="modal__title" id="delete-check-dialog-title">
          Удалить чек?
        </h3>
        <p className="modal__message" id="delete-check-dialog-desc">
          Чек «{checkToDelete?.title}» будет удалён без возможности восстановления.
        </p>
        <div className="modal__buttons">
          <Button type="button" onClick={() => setCheckToDelete(null)}>
            Отмена
          </Button>
          <Button type="button" variant="danger" onClick={confirmDeleteCheck}>
            Удалить
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h3 className="modal__title">Редактировать чек</h3>
        <form className="modal__inputs" onSubmit={(e) => handleEditSubmit(e)}>
          <input
            type="text"
            className="modal__input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Название чека"
            autoComplete="off"
            autoFocus
          />
          <div className="modal__buttons">
            <Button onClick={() => setIsEditModalOpen(false)}>Отмена</Button>
            <Button type="submit" className="button--active">
              Сохранить
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ChecksPage
