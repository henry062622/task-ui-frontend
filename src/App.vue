<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->

  <RouterView />
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth';
import api from './lib/axios';

const auth = useAuthStore();

// IMPORTANT: Replace this with your actual public VAPID key from your Laravel backend config.
const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
console.log(vapidKey);

// Reactive state to hold the current notification permission status.
const permissionStatus = ref(Notification.permission);

/**
 * Converts a VAPID public key string to a Uint8Array, as required by the Push API.
 * @param {string} base64String The VAPID public key.
 * @returns {Uint8Array}
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};

/**
 * Prompts the user for push notification permission and subscribes to the push service.
 */
const askPushPermission = async () => {
  // Check if push notifications are supported by the browser.
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications are not supported by this browser.');
    return;
  }

  // Request permission from the user.
  const permission = await Notification.requestPermission();
  permissionStatus.value = permission;

  if (permission === 'granted') {
    try {
      // 1. Register the service worker.
      // We register it and then wait for it to be ready.
      await navigator.serviceWorker.register('/service-worker.js');

      // 2. Wait for the service worker to be ready and active. This prevents the "no active Service Worker" error.
      const reg = await navigator.serviceWorker.ready;
      console.log('Service worker is ready:', reg);

      // 3. Subscribe for push notifications with the VAPID key.
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      console.log('Push subscription object:', subscription);

      // 4. Send the subscription data to the backend.
      // We use the `axios` library here. Make sure you have it installed: `npm install axios`
      await api.post('/api/save-subscription', subscription, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Subscription sent to backend successfully.');
    } catch (e) {
      console.error('Push notification setup failed:', e);
    }
  } else {
    console.log('User denied or dismissed the permission prompt.');
  }
};

watch(() => auth.user, (newUser) => {
  if (newUser && permissionStatus.value === 'default') {
    askPushPermission();
  }
});
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
