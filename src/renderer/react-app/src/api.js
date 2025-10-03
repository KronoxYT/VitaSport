const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function request(path, options = {}) {
  const headers = options.headers || {}
  const token = sessionStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const text = await res.text()
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const data = JSON.parse(text || '{}')
    if (!res.ok) throw data
    return data
  }
  // si devuelve HTML o texto
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
  try {
    return JSON.parse(text)
  } catch (e) {
    return text
  }
}

export const get = (path) => request(path, { method: 'GET' })
export const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
export const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) })
export const del = (path) => request(path, { method: 'DELETE' })
