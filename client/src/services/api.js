import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('es_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('es_token');
      localStorage.removeItem('es_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Events
export const eventsAPI = {
  getAll: (params) => API.get('/events', { params }),
  getFeatured: () => API.get('/events/featured'),
  getOne: (id) => API.get(`/events/${id}`),
  getMyEvents: () => API.get('/events/my-events'),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
};

// Tickets
export const ticketsAPI = {
  getByEvent: (eventId) => API.get(`/tickets/event/${eventId}`),
  create: (data) => API.post('/tickets', data),
  update: (id, data) => API.put(`/tickets/${id}`, data),
  delete: (id) => API.delete(`/tickets/${id}`),
};

// Bookings
export const bookingsAPI = {
  create: (data) => API.post('/bookings', data),
  getMy: () => API.get('/bookings/my'),
  getOne: (id) => API.get(`/bookings/${id}`),
  getByEvent: (eventId) => API.get(`/bookings/event/${eventId}`),
  cancel: (id, data) => API.put(`/bookings/${id}/cancel`, data),
  checkIn: (data) => API.post('/bookings/check-in', data),
};

// Admin
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getAllEvents: (params) => API.get('/admin/events', { params }),
  featureEvent: (id, data) => API.put(`/admin/events/${id}/feature`, data),
};

// QR
export const qrAPI = {
  validate: (bookingRef) => API.get(`/qr/validate/${bookingRef}`),
};

export default API;
