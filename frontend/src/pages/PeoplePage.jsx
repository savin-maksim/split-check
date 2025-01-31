import { useState, useEffect } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useParams, useNavigate } from 'react-router-dom'
import personService from '../api/person.service'
import checkService from '../api/check.service'

// Import components
import PersonButton from '../components/Button/PersonButton'
import AddPersonModal from '../components/Modal/AddPersonModal'
import Arrow from '../components/Arrow/Arrow'
import Spinner from '../components/Spinner/Spinner'

// Import styles
import './people-section.scss'

function PeoplePage() {
  const { checkId } = useParams()
  const navigate = useNavigate()
  const { isModalOpen, setIsModalOpen, setCurrentCheck } = useApp()
  const [check, setCheck] = useState(null)
  const [people, setPeople] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка чека и списка участников
  useEffect(() => {
    loadCheckAndPeople()
  }, [checkId])

  const loadCheckAndPeople = async () => {
    try {
      setIsLoading(true)
      const [checkResponse, peopleResponse] = await Promise.all([
        checkService.getCheckById(checkId),
        personService.getPeople(checkId)
      ])
      setCheck(checkResponse)
      setCurrentCheck(checkResponse)
      setPeople(peopleResponse)
    } catch (err) {
      setError(err.message || 'Не удалось загрузить данные')
      if (err.message === 'Check not found') {
        navigate('/')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPerson = async (newPersonName) => {
    try {
      const names = newPersonName
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map(name => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        }))

      // Добавляем каждого участника через API
      for (const personData of names) {
        await personService.createPerson(checkId, personData)
      }

      // Перезагружаем список участников
      const response = await personService.getPeople(checkId)
      setPeople(response)
      setIsModalOpen(null)
    } catch (err) {
      setError(err.message || 'Не удалось добавить участника')
    }
  }

  const handleRemovePerson = async (personId) => {
    try {
      await personService.deletePerson(checkId, personId)
      // Обновляем локальное состояние
      setPeople(people.filter(p => p.id !== personId))
    } catch (err) {
      setError(err.message || 'Не удалось удалить участника')
    }
  }

  if (isLoading) {
    return (
      <div className="people-section">
        <div className="people-section__empty">
          <Spinner size={48} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="people-section">
        <div className="people-section__empty">
          <div className="error-message">{error}</div>
          <button onClick={loadCheckAndPeople} className="retry-button">
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="people-section">

      {people.length === 0 ? (
        <div className="people-section__empty">
          <UserPlus size={48} />
          <h2>Добавьте участников</h2>
          <p>Нажмите на кнопку в навигационной панели, чтобы добавить людей, между которыми нужно разделить расходы</p>
          <Arrow title={'Тык'} />
        </div>
      ) : (
        <>
          <h2 className="people-section__title">Активные участники</h2>
          <div className="people-section__people">
            {people.map((person) => (
              <PersonButton
                key={person.id}
                className="people-section__person"
                icon={<X size={16} />}
                onClick={() => handleRemovePerson(person.id)}
              >
                {person.name}
              </PersonButton>
            ))}
          </div>
        </>
      )}

      <AddPersonModal
        isOpen={isModalOpen === 'addPerson'}
        onClose={() => setIsModalOpen(null)}
        onSubmit={handleAddPerson}
        title="Добавить человека"
      />
    </div>
  )
}

export default PeoplePage 