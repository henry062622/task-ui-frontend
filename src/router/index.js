import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '@/views/auth/Login.vue'
import TwoFactoryVerify from '@/views/auth/TwoFactoryVerify.vue'
import DashboardView from '@/views/DashboardView.vue'
import { useAuthStore } from '@/stores/auth'
import IpWhitelist from '@/views/IpWhitelist.vue'
import Role from '@/views/Role.vue'
import Group from '@/views/Group.vue'
import User from '@/views/User.vue'
import NoPermission from '@/views/NoPermission.vue'
import UserProfile from '@/views/UserProfile.vue'
import TaskCreate from '@/views/task/TaskCreate.vue'
import TaskEditView from '@/views/task/TaskEditView.vue'
import SystemFiles from '@/views/SystemFiles.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { guestOnly: true } },
  { path: '/two-factory/verify', component: TwoFactoryVerify, meta: { guestOnly: true } },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  // {
  //   path: '/ip-whitelist',
  //   component: IpWhitelist,
  //   meta: { requiresAuth: true, permission: 'ip_whitelist_read' },
  // },
  { path: '/role', component: Role, meta: { requiresAuth: true, permission: 'role_read' } },
  { path: '/group', component: Group, meta: { requiresAuth: true, permission: 'group_read' } },
  { path: '/user', component: User, meta: { requiresAuth: true, permission: 'user_read' } },
  { path: '/no-permission', component: NoPermission },
  { path: '/setting', component: UserProfile },
  { path: '/task-create', component: TaskCreate, meta: { requiresAuth: true } },
  { path: '/tasks/:id', component: TaskEditView, meta: { requiresAuth: true } },
  { path: '/system-files', component: SystemFiles, meta: { requiresAuth: true } },
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

  // Check if the route has a permission requirement
  if (to.meta.permission) {
    const hasPermission = auth.hasPermission(to.meta.permission)

    if (!hasPermission) {
      return next('/no-permission') // Redirect to "No Permission" page
    }
  }

  next()
})

export default router
