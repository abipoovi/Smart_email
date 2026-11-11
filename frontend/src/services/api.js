import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const generateEmail = (data) => api.post('/api/generate', data)
export const replyEmail = (data) => api.post('/api/reply', data)
export const improveEmail = (data) => api.post('/api/improve', data)
export const summarizeEmail = (data) => api.post('/api/summarize', data)
export const saveEmail = (data) => api.post('/api/emails', data)
export const getEmails = (page = 1, limit = 10) => api.get(`/api/emails?page=${page}&limit=${limit}`)
export const updateEmail = (id, data) => api.put(`/api/emails/${id}`, data)
export const deleteEmail = (id) => api.delete(`/api/emails/${id}`)
export const healthCheck = () => api.get('/api/health')

export default api
