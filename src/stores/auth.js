import { defineStore } from 'pinia'
import axios from '@/lib/axios'
import { ref } from 'vue'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const permissions = ref([])
  const loaded = ref(false)

  async function fetchUser() {
    if (loaded.value) return
    try {
      const { data } = await axios.get('/api/user')
      user.value = data.data
      permissions.value = data.data.permissions || []
      console.log(data.data)
    } catch {
      user.value = null
      permissions.value = []
    } finally {
      loaded.value = true
    }
  }

  async function logout() {
    await axios.post('/api/logout')
    user.value = null
    loaded.value = false
    router.push('/login')
  }

  function hasPermission(permission) {
    return permissions.value.includes(permission)
  }

  return { user, permissions, loaded, fetchUser, logout, hasPermission }
})
