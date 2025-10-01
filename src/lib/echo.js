import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

export default function makeEcho(token) {
  window.Pusher = Pusher

  const scheme = (import.meta.env.VITE_PUSHER_SCHEME || 'https').toLowerCase()
  const useTLS = scheme === 'https'
  const host = import.meta.env.VITE_PUSHER_HOST || undefined
  const port = import.meta.env.VITE_PUSHER_PORT ? Number(import.meta.env.VITE_PUSHER_PORT) : undefined

  // 👇 set your backend base URL here
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  return new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: useTLS,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,

    // 👇 point to Laravel, not Vite
    authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token || ''}`,
        Accept: 'application/json',
      },
    },
  })
}
