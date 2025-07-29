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

console.log('DEBUG: Imported EN locale (variable "en"):', en) // <--- ADD THIS
console.log('DEBUG: Imported TH locale (variable "th"):', th) // <--- ADD THIS

const messages = { en, th }

console.log('DEBUG: Messages object passed to createI18n:', messages)

// 2) pick initial locale (you can read from localStorage or navigator.language)
const defaultLocale = localStorage.getItem('lang') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages,
})

console.log('DEBUG: i18n global messages AFTER setup:', i18n) // <--- ADD THIS
console.log(
  'DEBUG: Attempting direct access to nested key (EN):',
  i18n.global.getLocaleMessage('en').twoFactor.required.title,
) // <--- ADD THIS
console.log('DEBUG: Attempting direct access to nested key (TH):', i18n.global.messages.th)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(i18n)

app.mount('#app')
