import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/lib/axios'

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

  return {
    notificationList,
    getLatestNotificationList,
    markAllNotificationsAsRead,
    unreadCount,
    hasUnread,
  }
})
