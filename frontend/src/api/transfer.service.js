import api from './axios';

export const transferService = {
  async getCheckTransfers(checkId) {
    const response = await api.get(`/checks/${checkId}/transfers`);
    return response;
  }
}; 