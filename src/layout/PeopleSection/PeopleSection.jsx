import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'

// Import components
import ActionButton from '../../components/Button/ActionButton'
import PersonButton from '../../components/Button/PersonButton'
import AddPersonModal from '../../components/Modal/AddPersonModal'

// Import styles
import './people-section.scss'

function PeopleSection({ people, onAddPerson, onRemovePerson }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')

  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      const maxId = Math.max(0, ...people.map(p => p.id))
      
      const names = newPersonName
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map((name, index) => ({
          id: maxId + index + 1,
          name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        }))

      onAddPerson(names)
      
      setNewPersonName('')
      setIsModalOpen(false)
    }
  }

  return (
    <div className="people-section">
      <ActionButton 
        icon={<UserPlus />}
        onClick={() => setIsModalOpen(true)}
      >
        Добавить людей
      </ActionButton>

      <div className="people-section__people">
        {people.map((person) => (
          <PersonButton
            key={person.id}
            className="people-section__person"
            icon={<X size={16} />}
            onClick={() => onRemovePerson(person.id)}
          >
            {person.name}
          </PersonButton>
        ))}
      </div>

      <AddPersonModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPerson}
        title="Добавить человека"
      >
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Введите имена через запятую"
          className="modal__input"
          autoFocus
        />
      </AddPersonModal>
    </div>
  )
}

export default PeopleSection