import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/lib/axios'
import makeEcho from '@/lib/echo'
import { notification } from 'ant-design-vue'
import router from '@/router'

export const useNotiStore = defineStore('notifications', () => {
  const notificationList = ref([])

  const getLatestNotificationList = async () => {
    await api.get('/api/notifications/latest').then((res) => {
      notificationList.value = res.data.data
      console.log(notificationList.value)
    })
  }

  // Computed property to get count of unread notifications
  const unreadCount = computed(() => notificationList.value.filter((noti) => !noti.read_at).length)

  // Or boolean for presence of unread notifications
  const hasUnread = computed(() => unreadCount.value > 0)

  const markAllNotificationsAsRead = async () => {
    await api.post('/api/notifications/read-all')
  }

  // 🔽 realtime state
  const echoRef = ref(null)        // <-- keep the Echo instance here
  const channel = ref(null)
  const currentUserId = ref(null)

  const showAntToast = (n) => {
    const title = n.data?.title || 'Notification'
    const body = n.data?.body || ''
    const url = n.data?.url

    notification.open({
      key: n.id,                          // dedupe/update by id
      message: title,
      description: body,
      placement: 'topRight',
      duration: 4.5,                      // adjust if you want
      onClick: () => { if (url) router.push(url) },
    })
  }

  const normalizeIncoming = (payload) => {
    if (payload && payload.data) {
      return {
        id: payload.id ?? (crypto?.randomUUID?.() || String(Date.now())),
        data: payload.data,
        created_at: payload.created_at || new Date().toISOString(),
        read_at: null,
      }
    }
    return {
      id: payload?.id ?? (crypto?.randomUUID?.() || String(Date.now())),
      data: payload ?? {},
      created_at: payload?.created_at || new Date().toISOString(),
      read_at: null,
    }
  }

  const initRealtime = (userId) => {
    teardownRealtime()
    currentUserId.value = userId

    // ⬇️ create an Echo instance using your factory
    const token = localStorage.getItem('auth_token') || ''
    echoRef.value = makeEcho(token)

    // ⬇️ subscribe using the instance
    channel.value = echoRef.value.private(`users.${userId}`)

    // Laravel Notification helper
    channel.value.notification((payload) => {
      const n = normalizeIncoming(payload)
      console.log('laravel noti', payload)
      console.log(n);
      if (!notificationList.value.find(x => x.id && n.id && x.id === n.id)) {
        notificationList.value.unshift(n)
        showAntToast(n)
      }
      console.log(notificationList.value)
    })
  }

  const teardownRealtime = () => {
    try {
      if (echoRef.value && currentUserId.value) {
        echoRef.value.leave(`users.${currentUserId.value}`)
      }
      echoRef.value?.disconnect?.()
    } catch (e) {
      console.log(e)
    }
    channel.value = null
    currentUserId.value = null
    echoRef.value = null
  }
  // ------------------------------
  // 🔼 END realtime bits
  // ------------------------------

  return {
    notificationList,
    getLatestNotificationList,
    markAllNotificationsAsRead,
    unreadCount,
    hasUnread,
    initRealtime,
    teardownRealtime,
  }
})
