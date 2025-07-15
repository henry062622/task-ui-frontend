import { defineStore } from 'pinia'
import axios from '@/lib/axios'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loaded = ref(false)

  async function fetchUser() {
    if (loaded.value) return
    try {
      const { data } = await axios.get('/api/user')
      user.value = data.data
      console.log(data.data)
    } catch {
      user.value = null
    } finally {
      loaded.value = true
    }
  }

  function logout() {
    user.value = null
    loaded.value = false
  }

  return { user, loaded, fetchUser, logout }
})
