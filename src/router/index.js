import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '@/views/auth/Login.vue'
import TwoFactoryVerify from '@/views/auth/TwoFactoryVerify.vue'
import DashboardView from '@/views/DashboardView.vue'
import { useAuthStore } from '@/stores/auth'
import IpWhitelist from '@/views/IpWhitelist.vue'
import Role from '@/views/Role.vue'
import Group from '@/views/Group.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { guestOnly: true } },
  { path: '/two-factory/verify', component: TwoFactoryVerify, meta: { guestOnly: true } },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/ip-whitelist', component: IpWhitelist, meta: { requiresAuth: true } },
  { path: '/role', component: Role, meta: { requiresAuth: true } },
  { path: '/group', component: Group, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (!auth.loaded) await auth.fetchUser()

  const isLoggedIn = !!auth.user
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login')
  }
  if (to.meta.guestOnly && isLoggedIn) {
    return next('/dashboard')
  }
  next()
})

export default router
