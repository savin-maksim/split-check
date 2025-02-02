import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserPlus, X, Users } from 'lucide-react';
import Modal from './Modal';
import IconButton from '../Button/IconButton';
import ActionButton from '../Button/ActionButton';
import DeleteConfirmModal from './DeleteConfirmModal';
import groupService from '../../api/group.service';
import Spinner from '../Spinner/Spinner';
import './manage-groups-modal.scss';
import PersonButton from '../Button/PersonButton';

function ManageGroupsModal({ isOpen, onClose }) {
  const [groups, setGroups] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMembers, setNewMembers] = useState('');
  const [addGroupMembers, setAddGroupMembers] = useState('');
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberGroupId, setMemberGroupId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await groupService.getGroups();
      setGroups(response);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить группы');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const members = newMembers
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)
        .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
      const response = await groupService.createGroup({
        name: newGroupName,
        members
      });
      setGroups(prevGroups => {
        const newGroups = prevGroups ? [...prevGroups] : [];
        newGroups.push(response);
        return newGroups;
      });
      await loadGroups();
      setIsAddingGroup(false);
      setNewGroupName('');
      setNewMembers('');
    } catch (err) {
      setError(err.message || 'Не удалось создать группу');
    }
  };

  const handleUpdateGroup = async (groupId, newName) => {
    try {
      const response = await groupService.updateGroup(groupId, { name: newName });
      setGroups(prevGroups => {
        if (!prevGroups) return [];
        return prevGroups.map(group =>
          group.id === groupId ? { ...group, name: newName } : group
        );
      });
      setSelectedGroup(null);
    } catch (err) {
      setError(err.message || 'Не удалось обновить группу');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await groupService.deleteGroup(groupId);
      setGroups(prevGroups => {
        if (!prevGroups) return [];
        return prevGroups.filter(group => group.id !== groupId);
      });
      setGroupToDelete(null);
    } catch (err) {
      setError(err.message || 'Не удалось удалить группу');
    }
  };

  const handleStartDelete = (group) => {
    setGroupToDelete(group);
  };

  const handleAddMembers = async (groupId) => {
    try {
      const members = addGroupMembers
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)
        .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
      const response = await groupService.addMembers(groupId, members);
      setGroups(prevGroups => {
        if (!prevGroups) return [];
        return prevGroups.map(group =>
          group.id === groupId ? response : group
        );
      });
      setAddGroupMembers('');
    } catch (err) {
      setError(err.message || 'Не удалось добавить участников');
    }
  };

  const handleRemoveMember = async (groupId, memberId) => {
    try {
      const response = await groupService.removeMember(groupId, memberId);
      setGroups(prevGroups => {
        if (!prevGroups) return [];
        return prevGroups.map(group =>
          group.id === groupId ? response : group
        );
      });
      setMemberToDelete(null);
      setMemberGroupId(null);
    } catch (err) {
      setError(err.message || 'Не удалось удалить участника');
    }
  };

  const handleStartMemberDelete = (group, member) => {
    setMemberToDelete(member);
    setMemberGroupId(group.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Управление группами"
      className="manage-groups-modal"
    >
      {/* <div className="manage-groups-modal__content"> */}
      {error && <div className="error-message">{error}</div>}

      <div className="groups-header">
        <h2 className=''>Мои группы</h2>
        <IconButton
          icon={<Plus size={20} />}
          onClick={() => setIsAddingGroup(true)}
          className="button--icon-primary small"
          title="Создать новую группу"
        />
      </div>

      {isAddingGroup && (
        <div className="add-group-form">
          <input
            type="text"
            placeholder="Название группы"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <input
            placeholder="Участники (через запятую)"
            value={newMembers}
            onChange={(e) => setNewMembers(e.target.value)}
          />
          <div className="form-actions">
            <ActionButton
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
            >
              Создать
            </ActionButton>
            <ActionButton
              onClick={() => {
                setIsAddingGroup(false);
                setNewGroupName('');
                setNewMembers('');
              }}
            >
              Отмена
            </ActionButton>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <Spinner size={32} />
        </div>
      ) : error ? (
        <div className="empty-state">
          <Users size={48} />
          <p>Ошибка загрузки групп</p>
          <p>{error}</p>
        </div>
      ) : !groups || !Array.isArray(groups) ? (
        <div className="empty-state">
          <Users size={48} />
          <p>Нет доступных групп</p>
          <p>Создайте новую группу, нажав на кнопку "+"</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>У вас пока нет групп</p>
          <p>Создайте новую группу, нажав на кнопку "+"</p>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map(group => group && (
            <>
              <div key={group.id} className="group-item">
                <div className="group-header">
                  {selectedGroup === group.id ? (
                    <input
                      type="text"
                      value={group.name || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setGroups(prevGroups => {
                          if (!prevGroups) return [];
                          return prevGroups.map(g =>
                            g?.id === group.id ? { ...g, name: newValue } : g
                          );
                        });
                      }}
                      onBlur={() => {
                        if (group.name?.trim()) {
                          handleUpdateGroup(group.id, group.name);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <h4 className='group-header__title'>{group.name || 'Без названия'}</h4>
                  )}
                  <div className="group-actions">
                    <IconButton
                      icon={<Edit2 size={20} />}
                      onClick={() => setSelectedGroup(group.id)}
                      title="Редактировать название"
                      className="small"
                    />
                    <IconButton
                      icon={<Trash2 size={20} />}
                      onClick={() => handleStartDelete(group)}
                      title="Удалить группу"
                      className="small"
                    />
                  </div>
                </div>

                <div className="group-members">
                  {Array.isArray(group.members) && group.members.map(member => member && (
                    <div key={member.id} className="member-item">
                      <PersonButton
                        className={'button__person--active'}
                        icon={<X size={16} />}
                        onClick={() => handleStartMemberDelete(group, member)}
                        title="Удалить участника"
                      >
                        {member.name || 'Без имени'}
                      </PersonButton>
                    </div>
                  ))}
                </div>

                <div className="add-members">
                  <input
                    type="text"
                    placeholder="Добавить участников (через запятую)"
                    value={addGroupMembers}
                    onChange={(e) => setAddGroupMembers(e.target.value)}
                  />
                  <IconButton
                    icon={<UserPlus size={20} />}
                    onClick={() => handleAddMembers(group.id)}
                    title="Добавить участников"
                    className="small"
                    disabled={!addGroupMembers.trim()}
                  />
                </div>
              </div>
              <hr className='groups-list__hr' />
            </>
          ))}
        </div>
      )}
      {/* </div> */}

      {groupToDelete && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setGroupToDelete(null)}
          onConfirm={() => handleDeleteGroup(groupToDelete.id)}
          title="Удаление группы"
          message={`Вы уверены, что хотите удалить группу "${groupToDelete.name}"?`}
        />
      )}

      {memberToDelete && memberGroupId && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => {
            setMemberToDelete(null);
            setMemberGroupId(null);
          }}
          onConfirm={() => handleRemoveMember(memberGroupId, memberToDelete.id)}
          title="Удаление участника из группы"
          message={`Вы уверены, что хотите удалить участника "${memberToDelete.name}" из группы?`}
        />
      )}
    </Modal>
  );
}

export default ManageGroupsModal; 