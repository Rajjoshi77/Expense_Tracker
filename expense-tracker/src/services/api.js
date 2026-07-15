/**
 * API Service — Centralized backend communication
 */
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 30000, // AI requests can take time
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to automatically attach authorization token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ── Auth API ────────────────────────────────────────

export const authApi = {
  loginWithGoogle: (credential) => API.post('/auth/google', { credential }).then(r => r.data),
  loginWithSandbox: (email) => API.post('/auth/sandbox', { email }).then(r => r.data),
};

// ── Expense API ─────────────────────────────────────

export const expenseApi = {
  getAll: (params = {}) => API.get('/expenses', { params }).then(r => r.data),
  getStats: () => API.get('/expenses/stats').then(r => r.data),
  create: (data) => API.post('/expenses', data).then(r => r.data),
  update: (id, data) => API.put(`/expenses/${id}`, data).then(r => r.data),
  delete: (id) => API.delete(`/expenses/${id}`).then(r => r.data),
};

// ── AI API ──────────────────────────────────────────

export const aiApi = {
  chat: (message) => API.post('/ai/chat', { message }).then(r => r.data),
  search: (query) => API.post('/ai/search', { query }).then(r => r.data),
  getInsights: () => API.get('/ai/insights').then(r => r.data),
  getChatHistory: (limit = 50) => API.get('/ai/history', { params: { limit } }).then(r => r.data),
  clearHistory: () => API.delete('/ai/history').then(r => r.data),
};

// ── Budget API ──────────────────────────────────────

export const budgetApi = {
  getAll: () => API.get('/budgets').then(r => r.data),
  create: (data) => API.post('/budgets', data).then(r => r.data),
  delete: (id) => API.delete(`/budgets/${id}`).then(r => r.data),
};

// ── Subscription API ────────────────────────────────

export const subscriptionApi = {
  getAll: () => API.get('/subscriptions').then(r => r.data),
  create: (data) => API.post('/subscriptions', data).then(r => r.data),
  update: (id, data) => API.put(`/subscriptions/${id}`, data).then(r => r.data),
  delete: (id) => API.delete(`/subscriptions/${id}`).then(r => r.data),
};

// ── OCR API ─────────────────────────────────────────

export const ocrApi = {
  scanReceipt: (formData) => API.post('/ocr/receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
};

// ── Import API ──────────────────────────────────────

export const importApi = {
  parseStatement: (formData) => API.post('/import/bank-statement', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
  confirmImport: (transactions) => API.post('/import/confirm', { transactions }).then(r => r.data),
};

// ── Prediction API ──────────────────────────────────

export const predictionApi = {
  getForecast: () => API.get('/predictions/forecast').then(r => r.data),
};

// ── Income API ──────────────────────────────────────

export const incomeApi = {
  getAll: () => API.get('/incomes').then(r => r.data),
  create: (data) => API.post('/incomes', data).then(r => r.data),
  delete: (id) => API.delete(`/incomes/${id}`).then(r => r.data),
};

export default API;
