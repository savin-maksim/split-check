import { useState, useEffect } from 'react';
import Modal from './Modal';
import groupService from '../../api/group.service';
import { Users } from 'lucide-react';
import ActionButton from '../Button/ActionButton';
import './modal.scss';

function AddPersonModal({ isOpen, onClose, onSubmit, title }) {
  const [name, setName] = useState('');
  const [groups, setGroups] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const response = await groupService.getGroups();
      setGroups(response);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить группы');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedGroup) {
      // Если выбрана группа, передаем имена всех участников группы
      const members = selectedGroup.members.map(member => member.name).join(', ');
      onSubmit(members);
    } else {
      // Если группа не выбрана, передаем введенные имена
      onSubmit(name);
    }
    setName('');
    setSelectedGroup(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="modal__title">{title}</h2>
        <div className="modal__inputs">
          <input
            className="modal__input"
            placeholder="Введите имена через запятую"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSelectedGroup(null);
            }}
            disabled={selectedGroup !== null}
          />

          {groups && groups.length > 0 && (
            <div className="modal__groups">
              <div className="modal__groups-header">
                <Users size={20} />
                <h4 className=''>Или выберите группу</h4>
              </div>
              <div className="modal__groups-list">
                {groups.map(group => (
                  <button
                    key={group.id}
                    type="button"
                    className={`button button__person modal__group-item ${selectedGroup?.id === group.id ? 'button__person--active' : ''}`}
                    onClick={() => {
                      setSelectedGroup(selectedGroup?.id === group.id ? null : group);
                      setName('');
                    }}
                  >
                    <span className="group-name">{group.name}</span>
                    {/* <span className="members-count"> */}
                      {/* {group.members?.length || 0} участников */}
                    {/* </span> */}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal__buttons">
          <ActionButton
            type="submit"
            disabled={!name.trim() && !selectedGroup}
            onClick={handleSubmit}
          >
            Добавить
          </ActionButton>
          <ActionButton
            type="button"
            onClick={() => {
              onClose();
              setName('');
              setSelectedGroup(null);
            }}
          >
            Отмена
          </ActionButton>
        </div>
    </Modal>
  );
}

export default AddPersonModal; 