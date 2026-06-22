const axios = require('axios');

let apiBaseURL = 'http://localhost:5001/api';
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  apiBaseURL = `http://${host}:5001/api`;
}

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization token
API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch unauthorized states
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Avoid infinite redirects on public shared form pages
        if (!window.location.pathname.startsWith('/form/')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth requests
const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Form requests
const formService = {
  createForm: (data) => API.post('/forms', data),
  getForms: () => API.get('/forms'),
  getFormById: (id) => API.get(`/forms/${id}`),
  updateForm: (id, data) => API.put(`/forms/${id}`, data),
  deleteForm: (id) => API.delete(`/forms/${id}`),
  duplicateForm: (id) => API.post(`/forms/${id}/duplicate`),
  getStats: () => API.get('/forms/dashboard/stats'),
};

// Response requests
const responseService = {
  submitResponse: (formId, answers) => API.post(`/responses/${formId}`, { answers }),
  getResponses: (formId, search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return API.get(`/responses/${formId}${query}`);
  },
  deleteResponse: (responseId) => API.delete(`/responses/${responseId}`),
};

module.exports = {
  API,
  authService,
  formService,
  responseService,
};
