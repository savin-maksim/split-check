import { useState } from 'react'
import { Pencil, UserPlus, Trash2, Users } from 'lucide-react'
import { useApp } from '@/context/AppContext'

import PageSectionHeader from '@/components/PageSectionHeader/PageSectionHeader'
import AddPersonModal from '@/components/Modal/AddPersonModal'
import EditPersonModal from '@/components/Modal/EditPersonModal'
import Modal from '@/components/Modal/Modal'
import Arrow from '@/components/Arrow/Arrow'

import './people-section.scss'
import Button from '@/components/Button/Button'
import IconButton from '@/components/Button/IconButton'
import MarqueeTitle from '@/components/MarqueeTitle/MarqueeTitle'

/** 1 человек, 2 человека, 5 человек, 11 человек */
function pluralizeParticipants(n) {
  const n100 = n % 100
  if (n100 >= 11 && n100 <= 14) return 'человек'
  const n10 = n % 10
  if (n10 === 1) return 'человек'
  if (n10 >= 2 && n10 <= 4) return 'человека'
  return 'человек'
}

function PeoplePage() {
  const { people, addPerson, removePerson, removeAllPeople, updatePerson, isModalOpen, setIsModalOpen } = useApp()
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)

  const handleAddPerson = (newPersonName) => {
    const maxId = Math.max(0, ...people.map((p) => p.id))

    const names = newPersonName
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name, index) => ({
        id: maxId + index + 1,
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      }))

    addPerson(names)
    setIsModalOpen(null)
  }

  const confirmRemoveAll = () => {
    removeAllPeople()
    setIsClearAllModalOpen(false)
  }

  const handleEditSubmit = (name) => {
    if (!editingPerson) return
    const ok = updatePerson(editingPerson.id, name)
    if (ok) setEditingPerson(null)
  }

  return (
    <div className="people-section">
      <div className="people-section__container">
        {people.length > 0 && (
          <PageSectionHeader
            icon={<Users size={28} aria-hidden />}
            title="Участники"
            subtitle={`${people.length} ${pluralizeParticipants(people.length)}`}
            action={
              <Button variant="danger" onClick={() => setIsClearAllModalOpen(true)}>
                Удалить всех
              </Button>
            }
          />
        )}

        {people.length === 0 ? (
          <div className="people-section__empty">
            <UserPlus size={48} />
            <h2>Добавьте участников</h2>
            <p>
              Нажмите на кнопку в навигационной панели, чтобы добавить людей, между которыми нужно разделить расходы
            </p>
            <Arrow />
          </div>
        ) : (
          <ul className="people-section__grid" role="list">
            {people.map((person) => (
              <li key={person.id} className="people-section__row">
                <MarqueeTitle as="h3">{person.name}</MarqueeTitle>
                <div className="people-section__row-actions">
                  <IconButton
                    icon={<Pencil />}
                    onClick={() => setEditingPerson(person)}
                    aria-label={`Редактировать имя: ${person.name}`}
                  />
                  <IconButton
                    className="icon-button--danger"
                    icon={<Trash2 />}
                    onClick={() => removePerson(person.id)}
                    aria-label={`Удалить ${person.name}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddPersonModal
        isOpen={isModalOpen === 'addPerson'}
        onClose={() => setIsModalOpen(null)}
        onSubmit={handleAddPerson}
        title="Добавить человека"
      />

      <EditPersonModal
        isOpen={editingPerson != null}
        onClose={() => setEditingPerson(null)}
        onSubmit={handleEditSubmit}
        initialName={editingPerson?.name ?? ''}
        title="Редактировать имя"
      />

      <Modal isOpen={isClearAllModalOpen} onClose={() => setIsClearAllModalOpen(false)}>
        <h2 className="modal__title">Удалить всех участников?</h2>
        <p className="people-section__modal-text">
          Будут удалены все участники и все расходы. Это действие нельзя отменить.
        </p>
        <div className="modal__buttons">
          <Button onClick={() => setIsClearAllModalOpen(false)}>Отмена</Button>
          <Button variant="danger" onClick={confirmRemoveAll}>
            Удалить всех
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default PeoplePage
