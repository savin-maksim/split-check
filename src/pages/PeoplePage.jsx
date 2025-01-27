import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Import components
import PersonButton from '../components/Button/PersonButton'
import AddPersonModal from '../components/Modal/AddPersonModal'

// Import styles
import './people-section.scss'

function PeoplePage() {
  const { people, addPerson, removePerson, isModalOpen, setIsModalOpen } = useApp()

  const handleAddPerson = (newPersonName) => {
    const maxId = Math.max(0, ...people.map(p => p.id))
    
    const names = newPersonName
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map((name, index) => ({
        id: maxId + index + 1,
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      }))

    addPerson(names)
    setIsModalOpen(null)
  }

  return (
    <div className="people-section">
      {people.length === 0 ? (
        <div className="people-section__empty">
          <UserPlus size={48} />
          <h2>Добавьте участников</h2>
          <p>Нажмите на кнопку в навигационной панели, чтобы добавить людей, между которыми нужно разделить расходы</p>
        </div>
      ) : (
        <div className="people-section__people">
          {people.map((person) => (
            <PersonButton
              key={person.id}
              className="people-section__person"
              icon={<X size={16} />}
              onClick={() => removePerson(person.id)}
            >
              {person.name}
            </PersonButton>
          ))}
        </div>
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