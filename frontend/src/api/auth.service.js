import api from './axios';

class AuthService {
  async login(email, password) {
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('Login successful, token and user stored');
      }
      return response;
    } catch (error) {
      console.error('Login error:', {
        error: error,
        response: error.response,
        message: error.message
      });
      throw error;
    }
  }

  async register(email, password, name) {
    try {
      console.log('Attempting registration for:', email);
      const response = await api.post('/auth/register', { email, password, name });
      console.log('Registration response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('Registration successful, token and user stored');
      }
      return response;
    } catch (error) {
      console.error('Registration error:', {
        error: error,
        response: error.response,
        message: error.message
      });
      throw error;
    }
  }

  logout() {
    console.log('Logging out, clearing storage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      console.log('Getting current user from storage:', userStr);
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    console.log('Checking authentication:', {
      token: token,
      isAuthenticated: isAuth
    });
    return isAuth;
  }
}

export default new AuthService(); 