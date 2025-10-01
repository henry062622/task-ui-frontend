<template>
  <a-layout has-sider :style="{ width: '100%', height: '100svh', background: '#fff' }">
    <!-- side bar -->
    <a-layout-sider :style="{ overflow: 'auto', height: '100%', position: 'fixed', left: 0, top: 0, bottom: 0, }">
      <div class="w-full text-white p-4 border-b border-gray-700 text-center text-lg !mb-4 !font-bold">
        {{ $t('task_management') }}
      </div>
      <a-menu :selectedKeys="selectedKeys" theme="dark" mode="inline" @update:selectedKeys="onSelect">
        <a-menu-item v-for="(menu, index) in filteredMenuItems" :key="menu.url">
          <div class="flex items-center gap-3">
            <Icon :icon="menu.icon" style="color: #fff; size: 32px;" />
            <span class="nav-text">{{ $t(menu.name) }}</span>
          </div>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <!-- main layout -->
    <a-layout :style="{ marginLeft: '200px', height: '100svh', background: '#fff', overflow: 'auto' }">
      <!-- nav bar -->
      <div class="p-5 shadow-md flex gap-4">
        <div v-if="site" class="flex gap-4 items-center">
          <img v-if="site.logo_url" :src="site.logo_url" alt="site_logo" class="site-logo w-15 h-8 ">
          <span v-else class=" text-2xl !font-extrabold">{{ site.name }}</span>
          <span class=" !text-xl !font-semibold">{{ $t('new_order') }}</span>
        </div>
        <div class="flex flex-1 justify-end items-center gap-3">
          <a-dropdown class="cursor-pointer" :trigger="['click']" @click="onNotificationClick">
            <div class="relative">
              <Icon icon="ion:notifications-outline" class="size-6 focus:outline-none" />
              <!-- Red dot if unread notifications -->
              <span v-if="noti.hasUnread"
                class="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
            </div>
            <template #overlay>
              <a-menu class="!mt-5 relative right-10">
                <!-- If no notifications -->
                <a-menu-item v-if="noti.notificationList.length === 0" disabled key="empty"
                  class="size-60 !flex justify-center items-center">
                  <span class="text-center flex justify-center !font-normal text-gray-500">No new
                    notifications</span>
                </a-menu-item>

                <!-- List notifications -->
                <a-menu-item v-for="(notification, index) in noti.notificationList" :key="notification.id || index"
                  @click="goToNotification(notification.data.url)" class="cursor-pointer">
                  <div class="flex flex-col gap-1">
                    <span class="!font-semibold text-sm">{{ notification.data.title }}</span>
                    <span class="text-xs text-gray-600">{{ notification.data.body }}</span>
                  </div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-divider type="vertical" class="!h-full" />
          <a-switch :checked="isEnglish" @change="toggleLanguage" class="flag-switch" />
          <a-divider type="vertical" class="!h-full" />
          <a-dropdown class="cursor-pointer" :trigger="['click']">
            <div class="flex justify-center items-center gap-2">
              <UserInfo :user="user" @click.prevent class="w-38" />
              <DownOutlined />
            </div>

            <template #overlay>
              <a-menu class="!mt-5 !mr-1">
                <a-menu-item key="0">
                  <UserInfo :user="user" class="w-full !mb-2" />
                </a-menu-item>
                <a-menu-item key="1">
                  <div class="flex items-center gap-3 pl-3" @click="goToProfilePage">
                    <Icon icon="iconamoon:eye-light" class="size-5" />
                    <span class="text-base !font-normal">{{ $t('view_pf') }}</span>
                  </div>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="3">
                  <div class="flex items-center gap-3 pl-3" @click.stop="Logout">
                    <Icon icon="humbleicons:logout" class="text-red-500 size-5" />
                    <span class="text-base !font-normal text-red-800 hover:text-red-500 ">{{
                      $t('logout') }}</span>
                  </div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
      <!-- breadcrumb -->
      <a-breadcrumb style="margin: 16px" v-if="breadcrumbList">
        <a-breadcrumb-item v-for="breadcrumb in breadcrumbList">{{ $t(breadcrumb) }}</a-breadcrumb-item>
      </a-breadcrumb>
      <!-- main content -->
      <div class="!m-4 h-full">
        <slot />
      </div>
    </a-layout>
  </a-layout>
</template>
<script setup>
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserInfo from '../user/UserInfo.vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { DownOutlined } from '@ant-design/icons-vue';
import { useNotiStore } from '@/stores/notifications';

defineProps({
  breadcrumbList: Array,
  site: Object
});

// menu items for side bar
const menuItems = ref([
  {
    id: 1,
    name: 'dashboard',
    url: '/dashboard',
    icon: 'mynaui:desktop',

  },
  {
    id: 3,
    name: 'user',
    url: '/user',
    icon: 'qlementine-icons:user-16',
    permission: 'user_read'
  },
  {
    id: 4,
    name: 'group',
    url: '/group',
    icon: 'fluent:people-team-20-regular',
    permission: 'group_read'
  },
  {
    id: 5,
    name: 'role',
    url: '/role',
    icon: 'solar:user-id-broken',
    permission: 'role_read'
  },
  {
    id: 6,
    name: 'system_files',
    url: '/system-files',
    icon: 'solar:folder-with-files-line-duotone',
  }
]);

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const noti = useNotiStore();
const { locale, t } = useI18n()
// reactive for switch position
const isEnglish = ref(locale.value === 'en')
const user = auth.user;
// selectedKeys holds an array of active keys (we use the URL string)
const selectedKeys = ref([]);

const Logout = async () => {
  noti.teardownRealtime()
  auth.logout();
}

const goToProfilePage = () => {
  router.push('/setting');
}

const goToNotification = (url) => {
  if (url) {
    router.push(url)
  }
}

const onNotificationClick = async () => {
  if (noti.hasUnread) {
    await noti.markAllNotificationsAsRead()
    // Update local read_at to simulate all read:
    const now = new Date().toISOString()
    noti.notificationList = noti.notificationList.map(notiItem => ({
      ...notiItem,
      read_at: now
    }))
  }
}

// when switch flips, swap locale
function toggleLanguage(checked) {
  locale.value = checked ? 'en' : 'th'
  isEnglish.value = checked
  localStorage.setItem('lang', locale.value)
}

// Filter the menu items based on user permissions
const filteredMenuItems = computed(() => {
  return menuItems.value.filter(menu => {
    if (!menu.permission) return true; // If there's no permission limit, show the item
    return auth.hasPermission(menu.permission); // Check if the user has permission for this menu item
  });
});

async function bootNoti() {
  if (!auth.user?.id) return
  await noti.getLatestNotificationList()
  if (!noti.channel) noti.initRealtime(auth.user.id) // guard so we don't double-subscribe
}

// On component mount, set the active menu based on current route
onMounted(() => {
  selectedKeys.value = [route.path];
  bootNoti();
});

// update the active menu item
watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath];
});

// if you want the switch to reflect outside changes to locale:
watch(locale, val => {
  isEnglish.value = (val === 'en')
})

// Called whenever a user clicks a menu item
function onSelect(keys) {
  if (keys.includes('logout')) return;
  const [targetPath] = keys;
  selectedKeys.value = keys;

  // Avoid redundant navigation
  if (targetPath && targetPath !== route.path) {
    router.push(targetPath);
  }
}
</script>
<style scoped>
.flag-switch {
  width: 50px;
  height: 23px;
  background-image: url('/th.png');
  background-size: cover;
  background-position: center;
  border: none;
}

:where(.css-dev-only-do-not-override-1p3hq3p).ant-switch:hover:not(.ant-switch-disabled) {
  background-image: url('/th.png');
  background-size: cover;
  background-position: center;
}

:where(.css-dev-only-do-not-override-1p3hq3p).ant-switch.ant-switch-checked:hover:not(.ant-switch-disabled) {
  background-image: url('/uk.png');
  background-size: cover;
  background-position: center;
}

/* when checked, show the UK/US flag */
.flag-switch.ant-switch-checked {
  background-image: url('/uk.png');
}

/* keep the handle visible on top */
.flag-switch .ant-switch-handle {
  background-color: #fff;
  width: 28px;
  height: 28px;
  top: 3px;
  left: 3px;
  transition: left .2s;
}

/* make sure the handle slides all the way */
.flag-switch.ant-switch-checked .ant-switch-handle {
  left: 29px;
}
</style>
