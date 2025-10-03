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
    localStorage.removeItem('auth_token')
    loaded.value = false
    router.push('/login')
  }

  function hasPermission(permission) {
    return permissions.value.includes(permission)
  }

  function userRole() {
    if (!user.value) return null
    if (user.value.role_id == 1) return 'super_admin'
    if (user.value.role_id == 2) return 'admin'
    if (user.value.role_id == 3) return 'ui_lead'
    if (user.value.role_id == 4) return 'ui'
    return null
  }

  return { user, permissions, loaded, fetchUser, logout, hasPermission, userRole }
})
