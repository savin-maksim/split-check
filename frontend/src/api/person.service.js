import api from './axios';

class PersonService {
  async getPeople(checkId) {
    try {
      return await api.get(`/checks/${checkId}/people`);
    } catch (error) {
      throw error;
    }
  }

  async createPerson(checkId, data) {
    try {
      return await api.post(`/checks/${checkId}/people`, data);
    } catch (error) {
      throw error;
    }
  }

  async updatePerson(checkId, personId, data) {
    try {
      return await api.put(`/checks/${checkId}/people/${personId}`, data);
    } catch (error) {
      throw error;
    }
  }

  async deletePerson(checkId, personId) {
    try {
      return await api.delete(`/checks/${checkId}/people/${personId}`);
    } catch (error) {
      throw error;
    }
  }
}

export default new PersonService(); 