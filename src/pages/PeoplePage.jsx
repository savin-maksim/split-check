import { useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { useApp } from '@/context/AppContext'

import PageSectionHeader from '@/components/PageSectionHeader/PageSectionHeader'
import PageEmptyState from '@/components/PageEmptyState/PageEmptyState'
import AddPersonModal from '@/components/Modal/AddPersonModal'
import EditPersonModal from '@/components/Modal/EditPersonModal'
import Modal from '@/components/Modal/Modal'
import Arrow from '@/components/Arrow/Arrow'

import './people-section.scss'
import Button from '@/components/Button/Button'
import Card from '@/components/Cards/Cost/Card'
import CardHeader from '@/components/Cards/Cost/CardHeader'
import formatters from '@/utils/formatters'

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
    <section className="people-section">
      {people.length > 0 && (
        <PageSectionHeader
          icon={<Users size={40} aria-hidden />}
          title="Участники"
          subtitle={`${people.length} ${formatters.pluralize(people.length, ['человек', 'человека', 'человек'])}`}
          action={
            <Button variant="danger" onClick={() => setIsClearAllModalOpen(true)}>
              Удалить всех
            </Button>
          }
        />
      )}

      {people.length === 0 ? (
        <PageEmptyState
          muted
          className="people-section__empty-state"
          icon={<UserPlus size={48} aria-hidden />}
          title="Добавьте участников"
          actions={<Arrow />}
        >
          <p>Нажмите на кнопку в навигационной панели, чтобы добавить людей, между которыми нужно разделить расходы</p>
        </PageEmptyState>
      ) : (
        <ul className="list-layout" role="list">
          {people.map((person) => (
            <Card as="li" key={person.id}>
              <CardHeader
                as="h3"
                title={person.name}
                onEdit={() => setEditingPerson(person)}
                onDelete={() => removePerson(person.id)}
                variantActions="largeGap"
              />
            </Card>
          ))}
        </ul>
      )}

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
    </section>
  )
}

export default PeoplePage
