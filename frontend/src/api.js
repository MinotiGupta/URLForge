import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('uf_token');
      localStorage.removeItem('uf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/api/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  },
  me: () => api.get('/api/auth/me'),
};

export const urlApi = {
  shorten: (data) => api.post('/api/shorten', data),
  list: () => api.get('/api/urls'),
  delete: (id) => api.delete(`/api/url/${id}`),
  update: (id, data) => api.put(`/api/url/${id}`, data),
  analytics: (id) => api.get(`/api/analytics/${id}`),
};

export const dashboardApi = {
  get: () => api.get('/api/dashboard'),
};

export const healthApi = {
  check: () => api.get('/api/health'),
};

export default api;
