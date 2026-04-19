import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('petzee_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('petzee_token');
      localStorage.removeItem('petzee_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

// ── Pets ─────────────────────────────────────────────────────────
export const petsAPI = {
  create:            (data) => api.post('/pets', data),
  list:              ()     => api.get('/pets'),
  get:               (id)   => api.get(`/pets/${id}`),
  update:            (id, data) => api.put(`/pets/${id}`, data),
  remove:            (id)   => api.delete(`/pets/${id}`),
  addVaccination:    (id, data) => api.post(`/pets/${id}/vaccinations`, data),
  getVaccinations:   (id)   => api.get(`/pets/${id}/vaccinations`),
};

// ── Bookings ──────────────────────────────────────────────────────
export const bookingsAPI = {
  create:       (data)       => api.post('/bookings', data),
  list:         (params)     => api.get('/bookings', { params }),
  get:          (id)         => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  addReview:    (id, data)   => api.post(`/bookings/${id}/review`, data),
};

// ── Services ──────────────────────────────────────────────────────
export const servicesAPI = {
  list:       (params) => api.get('/services', { params }),
  get:        (id)     => api.get(`/services/${id}`),
  myServices: ()       => api.get('/services/provider/me'),
  create:     (data)   => api.post('/services', data),
  update:     (id, data) => api.patch(`/services/${id}`, data),
  remove:     (id)     => api.delete(`/services/${id}`),
};

// ── Consultations ─────────────────────────────────────────────────
export const consultationsAPI = {
  listVets:    ()     => api.get('/consultations/vets'),
  create:      (data) => api.post('/consultations', data),
  list:        (params) => api.get('/consultations', { params }),
  getMessages: (id, params) => api.get(`/consultations/${id}/messages`, { params }),
  close:       (id)   => api.patch(`/consultations/${id}/close`),
};

// ── Notifications ─────────────────────────────────────────────────
export const notificationsAPI = {
  list:       (params) => api.get('/notifications', { params }),
  markRead:   (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead: ()      => api.patch('/notifications/read-all'),
};

// ── Admin ─────────────────────────────────────────────────────────
export const adminAPI = {
  stats:      ()     => api.get('/admin/stats'),
  users:      (params) => api.get('/admin/users', { params }),
  verifyUser: (id)   => api.patch(`/admin/users/${id}/verify`),
  deleteUser: (id)   => api.delete(`/admin/users/${id}`),
};

export default api;
