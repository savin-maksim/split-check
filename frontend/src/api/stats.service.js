import api from './axios';

export const statsService = {
  async getCheckStats(checkId) {
    const response = await api.get(`/checks/${checkId}/stats`);
    return response;
  }
}; 