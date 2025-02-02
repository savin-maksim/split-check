import api from './axios';

class ShareService {
  async createShareLink(checkId, type = 'readonly') {
    return api.post(`/share/${checkId}`, { type });
  }

  async getSharedCheck(token) {
    return api.get(`/share/${token}`);
  }
}

export const shareService = new ShareService(); 