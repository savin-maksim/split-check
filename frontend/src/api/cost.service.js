import api from './axios';

class CostService {
  async getCosts(checkId) {
    try {
      const response = await api.get(`/checks/${checkId}/costs`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error getting costs:', error.response || error);
      throw error;
    }
  }

  async getCostById(checkId, costId) {
    try {
      const response = await api.get(`/checks/${checkId}/costs/${costId}`);
      return response;
    } catch (error) {
      console.error('Error getting cost by id:', error.response || error);
      throw error;
    }
  }

  async createCost(checkId, data) {
    try {
      console.log('Creating cost with data:', data);
      const response = await api.post(`/checks/${checkId}/costs`, data);
      console.log('Create cost response:', response);
      return response;
    } catch (error) {
      console.error('Error creating cost:', error.response || error);
      throw error;
    }
  }

  async updateCost(checkId, costId, data) {
    try {
      const response = await api.put(`/checks/${checkId}/costs/${costId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating cost:', error.response || error);
      throw error;
    }
  }

  async deleteCost(checkId, costId) {
    try {
      const response = await api.delete(`/checks/${checkId}/costs/${costId}`);
      return response;
    } catch (error) {
      console.error('Error deleting cost:', error.response || error);
      throw error;
    }
  }
}

export default new CostService(); 