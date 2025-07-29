import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import en from '@/locales/en.json'
import th from '@/locales/th.json'
import { createI18n } from 'vue-i18n'

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
