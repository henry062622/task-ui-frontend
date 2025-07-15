import axios from 'axios'
import Cookies from 'js-cookie'

const apiBaseUrl = 'http://localhost:8000'
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
})

export const ensureCsrfToken = async () => {
  if (!Cookies.get('XSRF-TOKEN')) {
    await api.get('/sanctum/csrf-cookie')
  }
}

export default api
