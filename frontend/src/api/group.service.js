import api from './axios';

class GroupService {
  async getGroups() {
    return api.get('/groups');
  }

  async createGroup(data) {
    return api.post('/groups', data);
  }

  async updateGroup(groupId, data) {
    return api.put(`/groups/${groupId}`, data);
  }

  async deleteGroup(groupId) {
    return api.delete(`/groups/${groupId}`);
  }

  async addMembers(groupId, members) {
    return api.post(`/groups/${groupId}/members`, { members });
  }

  async removeMember(groupId, memberId) {
    return api.delete(`/groups/${groupId}/members/${memberId}`);
  }
}

export default new GroupService(); 