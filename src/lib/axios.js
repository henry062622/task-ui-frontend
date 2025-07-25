import axios from 'axios'
import Cookies from 'js-cookie'

// const apiBaseUrl = 'http://localhost:8000'
// const apiBaseUrl = 'https://only-immune-buck.ngrok-free.app'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const token = localStorage.getItem('auth_token')
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
  // withXSRFToken: true,
})

api.interceptors.request.use((config) => {
  const freshToken = localStorage.getItem('auth_token')
  if (freshToken) {
    config.headers.Authorization = `Bearer ${freshToken}`
  } else {
    delete config.headers.Authorization
  }
  return config
})

export const ensureCsrfToken = async () => {
  if (!Cookies.get('XSRF-TOKEN')) {
    await api.get('/sanctum/csrf-cookie')
  }
}

export default api
