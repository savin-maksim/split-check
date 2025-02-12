import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: 'http://splitcheck.ru/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ответов
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Если сервер вернул ошибку с статусом
      if (error.response.status === 401) {
        // Если токен истек или недействителен, очищаем локальное хранилище
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api; 