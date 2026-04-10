import { useState, useEffect, useRef, useCallback } from 'react'
import { Receipt, Users, Calculator, FolderInput } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useApp } from '@/context/AppContext'
import formatters from '@/utils/formatters'
import PageSectionHeader from '@/components/PageSectionHeader/PageSectionHeader'
import PageEmptyState from '@/components/PageEmptyState/PageEmptyState'
import Modal from '@/components/Modal/Modal'
import Button from '@/components/Button/Button'
import './checks-page.scss'
import Card from '@/components/Cards/Cost/Card'
import CardHeader from '@/components/Cards/Cost/CardHeader'
import CardFooter from '@/components/Cards/Cost/CardFooter'
import CardStats from '@/components/Cards/Cost/CardStats'
import InputField from '@/components/Input/InputField'

function sumCosts(costs) {
  return costs.reduce((s, c) => s + (Number(c.amount) || 0), 0)
}

function ChecksPage() {
  const navigate = useNavigate()
  const { sessionMeta, startNewCheck, newCheckModalNonce, savedChecks, deleteSavedCheck, updateSavedCheckTitle } =
    useApp()

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
      <PageSectionHeader icon={<Receipt size={40} aria-hidden />} title="Чеки" />

      <section className="checks-page__section">
        {savedChecks.length === 0 ? (
          <PageEmptyState muted className="checks-page__empty-saved" icon={<FolderInput size={40} aria-hidden />}>
            <p>Пока нет чеков — нажмите «Новый чек», задайте название и переходите к участникам.</p>
          </PageEmptyState>
        ) : (
          <ul className="list-layout">
            {savedChecks.map((check) => {
              const sum = sumCosts(check.costs || [])
              const pCount = (check.people || []).length
              const cCount = (check.costs || []).length
              const isActive = sessionMeta?.id === check.id
              return (
                <Card as="li" key={check.id} className={isActive ? 'card--active' : ''}>
                  <Link
                    to={`/check/${check.id}`}
                    onClick={(e) => {
                      if (sessionMeta?.id === check.id) {
                        e.preventDefault()
                        toast('Этот чек уже открыт')
                      }
                    }}
                  >
                    <article className="checks-page__saved-card-main">
                      <CardHeader
                        title={check.title}
                        as="h3"
                        onEdit={() => handleEdit(check)}
                        onDelete={() => setCheckToDelete({ id: check.id, title: check.title })}
                        variantActions="largeGap"
                      />

                      <time className="checks-page__saved-date" dateTime={new Date(check.createdAt).toISOString()}>
                        {formatters.formatSavedDate(check.createdAt)}
                      </time>

                      <CardFooter variant="grid">
                        <CardStats
                          icon={<Users size={18} aria-hidden />}
                          value={pCount}
                          label={formatters.pluralize(pCount, ['человек', 'человека', 'человек'])}
                        />
                        <CardStats
                          icon={<Calculator size={18} aria-hidden />}
                          value={cCount}
                          label={formatters.pluralize(cCount, ['позиция', 'позиции', 'позиций'])}
                        />
                        <CardStats
                          className="card-stats--sum"
                          icon={<Receipt size={18} aria-hidden />}
                          value={formatters.formatAmount(sum)}
                        />
                      </CardFooter>
                    </article>
                  </Link>
                </Card>
              )
            })}
          </ul>
        )}
      </section>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <h3 className="modal__title">Новый чек</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCreateSubmit(e)
          }}
        >
          <div className="modal__inputs">
            <InputField
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              label={'Наименование чека'}
              autoComplete="off"
              enterKeyHint="done"
              autoFocus
              required
            />
          </div>
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
        <form onSubmit={(e) => handleEditSubmit(e)}>
          <div className="modal__inputs">
            <InputField
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              label={'Название чека'}
              autoComplete="off"
              autoFocus
              required
            />
          </div>
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
