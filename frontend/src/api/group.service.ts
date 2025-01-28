import api from './axios'

class GroupService {
  async createGroup(data: { name: string }) {
    const response = await api.post('/groups', data)
    return response.data
  }

  async getGroups() {
    const response = await api.get('/groups')
    return response.data
  }

  async getGroupById(groupId: string) {
    const response = await api.get(`/groups/${groupId}`)
    return response.data
  }

  async updateGroup(groupId: string, data: { name: string }) {
    const response = await api.put(`/groups/${groupId}`, data)
    return response.data
  }

  async deleteGroup(groupId: string) {
    await api.delete(`/groups/${groupId}`)
  }

  async addMembers(groupId: string, memberIds: string[]) {
    const response = await api.post(`/groups/${groupId}/members`, { memberIds })
    return response.data
  }

  async removeMember(groupId: string, memberId: string) {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`)
    return response.data
  }
}

export default new GroupService() 