import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

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
      // Сначала получаем максимальный ID из существующих людей
      const maxId = Math.max(0, ...people.map(p => p.id))
      
      // Затем создаем массив имен с инкрементными ID
      const names = newPersonName
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map((name, index) => ({
          id: maxId + index + 1,
          name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        }))

      // Фильтруем только уникальные имена и находим дубликаты
      const duplicates = names.filter(newPerson => 
        people.some(p => p.name.toLowerCase() === newPerson.name.toLowerCase())
      ).map(p => p.name)

      const uniqueNames = names.filter(newPerson => 
        !people.some(p => p.name.toLowerCase() === newPerson.name.toLowerCase())
      )

      // Добавляем всех людей одним массивом
      if (uniqueNames.length > 0) {
        onAddPerson(uniqueNames)
        
        // Показываем уведомление об успешном добавлении
        if (uniqueNames.length === 1) {
          toast.success(`Участник ${uniqueNames[0].name} добавлен`)
        } else {
          toast.success(`Добавлено ${uniqueNames.length} участников`)
        }
      }

      // Если были дубликаты, показываем предупреждение
      if (duplicates.length > 0) {
        toast.error(`${duplicates.join(', ')} уже в списке`)
      }
      
      setNewPersonName('')
      setIsModalOpen(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPerson()
    }
  }

  return (
    <div className="people-section">
      {/* <h2 className='margin--bottom'>Люди</h2> */}
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
          onKeyDown={handleKeyDown}
          placeholder="Введите имена через запятую"
          className="modal__input"
          autoFocus
        />
      </AddPersonModal>
    </div>
  )
}

export default PeopleSection 