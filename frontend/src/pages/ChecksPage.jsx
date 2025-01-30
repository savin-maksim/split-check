import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Receipt, Search, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import authService from '../api/auth.service'
import checkService from '../api/check.service'
import './checks-page.scss'

// Components
import IconButton from '../components/Button/IconButton'
import Spinner from '../components/Spinner/Spinner'
import AddCheckModal from '../components/Modal/AddCheckModal'
import ManageGroupsModal from '../components/Modal/ManageGroupsModal'

function ChecksPage() {
  const navigate = useNavigate()
  const { isModalOpen, setIsModalOpen, setCurrentCheck } = useApp()
  const [checks, setChecks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCheck, setEditingCheck] = useState(null)

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
    if (!window.confirm('Вы уверены, что хотите удалить этот чек?')) return
    try {
      await checkService.deleteCheck(checkId)
      setChecks(checks.filter(check => check.id !== checkId))
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
            <div className="search-input">
              <Search size={20} />
              <input
                type="text"
                placeholder="Поиск по чекам"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="header-buttons">
              <IconButton
                icon={<Users size={24} />}
                onClick={() => setIsModalOpen('manageGroups')}
                className="button--icon-secondary"
                title="Управление группами"
              />
              {/* <IconButton
                icon={<Plus size={24} />}
                onClick={() => setIsModalOpen('addCheck')}
                className="button--icon-primary"
                title="Создать новый чек"
              /> */}
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
                      className="checks"
                    />
                    <IconButton
                      icon={<Trash2 size={16} />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCheck(check.id)
                      }}
                      title="Удалить чек"
                      className="checks"
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
        </div>
      </div>
    </>
  )
}

export default ChecksPage 