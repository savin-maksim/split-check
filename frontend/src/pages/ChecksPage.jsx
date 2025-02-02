import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Receipt, Search, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import authService from '../api/auth.service'
import checkService from '../api/check.service'
import './checks-page.scss'

// Components
import IconButton from '../components/Button/IconButton'
import ActionButton from '../components/Button/ActionButton'
import Spinner from '../components/Spinner/Spinner'
import AddCheckModal from '../components/Modal/AddCheckModal'
import ManageGroupsModal from '../components/Modal/ManageGroupsModal'
import SearchInput from '../components/Input/SearchInput'
import DeleteConfirmModal from '../components/Modal/DeleteConfirmModal'

function ChecksPage() {
  const navigate = useNavigate()
  const { isModalOpen, setIsModalOpen, setCurrentCheck } = useApp()
  const [checks, setChecks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCheck, setEditingCheck] = useState(null)
  const [checkToDelete, setCheckToDelete] = useState(null)

  // Загрузка списка чеков
  useEffect(() => {
    loadChecks()
    setCurrentCheck(null)
  }, [])

  const loadChecks = async () => {
    try {
      setIsLoading(true)
      const response = await checkService.getChecks()
      setChecks(response)
    } catch (err) {
      setError(err.message || 'Не удалось загрузить список чеков')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCheck = async (title) => {
    try {
      const response = await checkService.createCheck({ title })
      setChecks([...checks, response])
      setIsModalOpen(null)
      navigate(`/checks/${response.id}/people`)
    } catch (err) {
      setError(err.message || 'Не удалось создать чек')
    }
  }

  const handleEditCheck = async (title) => {
    try {
      const response = await checkService.updateCheck(editingCheck.id, { title })
      setChecks(checks.map(check =>
        check.id === editingCheck.id ? { ...check, title } : check
      ))
      setEditingCheck(null)
      setIsModalOpen(null)
    } catch (err) {
      setError(err.message || 'Не удалось обновить чек')
    }
  }

  const handleDeleteCheck = async (checkId) => {
    try {
      await checkService.deleteCheck(checkId)
      setChecks(checks.filter(check => check.id !== checkId))
      setCheckToDelete(null)
    } catch (err) {
      setError(err.message || 'Не удалось удалить чек')
    }
  }

  const handleNavigateToCheck = (checkId) => {
    navigate(`/checks/${checkId}/people`)
  }

  const handleStartEdit = (check) => {
    setEditingCheck(check)
    setIsModalOpen('editCheck')
  }

  const handleStartDelete = (check) => {
    setCheckToDelete(check)
  }

  const filteredChecks = checks.filter(check =>
    check.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <>
        <div className="checks-page">
          <div className="checks-page__message">
            <Spinner size={48} />
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="checks-page">
          <div className="checks-page__message">
            <div className="error-message">{error}</div>
            <button onClick={loadChecks} className="retry-button">
              Попробовать снова
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="checks-page">
        <div className="checks-page__content">
          <div className="checks-page__search-container">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по чекам"
            />
            <div className="header-buttons">
              <ActionButton
                // icon={<Users size={24} />}
                onClick={() => setIsModalOpen('manageGroups')}
                className="button--large"
                title="Управление группами"
              >
                Управление группами
              </ActionButton>
            </div>
          </div>

          {filteredChecks.length === 0 ? (
            <div className="checks-page__empty">
              <Receipt size={48} />
              <h2>Нет чеков</h2>
              <p>Создайте новый чек, нажав на кнопку "+"</p>
            </div>
          ) : (
            <div className="checks-page__list">
              {filteredChecks.map(check => (
                <div key={check.id} className="check-card">
                  <div className="check-card__content" onClick={() => handleNavigateToCheck(check.id)}>
                    <h3 className=''>{check.title}</h3>
                    <span>Создан: {new Date(check.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="check-card__actions">
                    <IconButton
                      icon={<Edit2 size={16} />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartEdit(check)
                      }}
                      title="Редактировать чек"
                      className="small"
                    />
                    <IconButton
                      icon={<Trash2 size={16} />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartDelete(check)
                      }}
                      title="Удалить чек"
                      className="small"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <AddCheckModal
            isOpen={isModalOpen === 'addCheck'}
            onClose={() => setIsModalOpen(null)}
            onSubmit={handleCreateCheck}
          />

          <AddCheckModal
            isOpen={isModalOpen === 'editCheck'}
            onClose={() => {
              setIsModalOpen(null)
              setEditingCheck(null)
            }}
            onSubmit={handleEditCheck}
            initialTitle={editingCheck?.title}
            isEditing={true}
          />

          <ManageGroupsModal
            isOpen={isModalOpen === 'manageGroups'}
            onClose={() => setIsModalOpen(null)}
          />

          {checkToDelete && (
            <DeleteConfirmModal
              isOpen={true}
              onClose={() => setCheckToDelete(null)}
              onConfirm={() => handleDeleteCheck(checkToDelete.id)}
              title="Удаление чека"
              message={`Вы уверены, что хотите удалить чек "${checkToDelete.title}"?`}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default ChecksPage 