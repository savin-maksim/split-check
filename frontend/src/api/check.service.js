import api from './axios';

class CheckService {
  async getChecks() {
    try {
      return await api.get('/checks');
    } catch (error) {
      throw error;
    }
  }

  async getCheckById(checkId) {
    try {
      return await api.get(`/checks/${checkId}`);
    } catch (error) {
      throw error;
    }
  }

  async createCheck(data) {
    try {
      return await api.post('/checks', data);
    } catch (error) {
      throw error;
    }
  }

  async updateCheck(checkId, data) {
    try {
      return await api.put(`/checks/${checkId}`, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteCheck(checkId) {
    try {
      return await api.delete(`/checks/${checkId}`);
    } catch (error) {
      throw error;
    }
  }

  // Получение статистики чека
  async getCheckStats(checkId) {
    try {
      const response = await api.get(`/checks/${checkId}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Получение переводов для чека
  async getCheckTransfers(checkId) {
    try {
      const response = await api.get(`/checks/${checkId}/transfers`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new CheckService(); 