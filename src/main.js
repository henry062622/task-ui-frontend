import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import th from './locales/th.json'
import { useNotiStore } from './stores/notifications'

const messages = { en, th }

// 2) pick initial locale (you can read from localStorage or navigator.language)
const defaultLocale = localStorage.getItem('lang') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages,
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(i18n)

app.mount('#app')

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'push-received') {
      const payload = event.data.payload

      // Access your notification store and update
      const notiStore = useNotiStore()
      notiStore.notificationList.unshift({
        id: Date.now(),
        data: {
          title: payload.title || 'New Notification',
          body: payload.body || 'You have a new message.',
          url: payload.data?.url || '/',
        },
        read_at: null,
      })

      // If more than 5, remove the last one
      if (notiStore.notificationList.length > 5) {
        notiStore.notificationList.pop()
      }
    }
  })
}
