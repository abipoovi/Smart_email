/**
 * SmartMail AI Extension - API Client
 * Connects directly to local FastAPI server on http://localhost:8000
 */

const API_BASE_URL = 'http://localhost:8000'

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const errorMsg = data.detail || `Request failed with status ${res.status}`
      throw new Error(errorMsg)
    }

    return data
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('Cannot connect to SmartMail backend (http://localhost:8000). Ensure the backend is running.')
    }
    throw err
  }
}

export const checkHealth = () => request('/api/health')

export const generateEmail = (payload) =>
  request('/api/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const replyEmail = (payload) =>
  request('/api/reply', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const improveEmail = (payload) =>
  request('/api/improve', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const summarizeEmail = (payload) =>
  request('/api/summarize', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const saveEmail = (payload) =>
  request('/api/emails', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

