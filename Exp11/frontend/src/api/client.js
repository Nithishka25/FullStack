import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const saveAuth = (payload) => {
  localStorage.setItem('auth', JSON.stringify(payload))
  setAuthToken(payload?.token)
  window.dispatchEvent(new Event('storage'))
}

export const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('auth'))
  } catch {
    return null
  }
}

export default api
