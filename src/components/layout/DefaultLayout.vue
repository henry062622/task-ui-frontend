<template>
    <a-layout has-sider :style="{ width: '100%', height: '100svh', background: '#fff' }">
        <a-layout-sider :style="{ overflow: 'auto', height: '100%', position: 'fixed', left: 0, top: 0, bottom: 0, }">
            <div class="!m-4 h-8 flex justify-center items-center rounded-2xl bg-[rgba(255,255,255,0.2)]">
                <!-- <h3 class="text-white">Task Management</h3> -->
            </div>
            <a-menu :selectedKeys="selectedKeys" theme="dark" mode="inline" @update:selectedKeys="onSelect">
                <a-menu-item v-for="(menu, index) in filteredMenuItems" :key="menu.url">
                    <div class="flex items-center gap-3">
                        <Icon :icon="menu.icon" style="color: #fff; size: 32px;" />
                        <span class="nav-text">{{ menu.name }}</span>
                    </div>
                </a-menu-item>
                <a-menu-item :key="'logout'" @click.stop="Logout" style="pointer-events: auto">
                    <div class="flex items-center gap-3">
                        <Icon icon="ri:logout-circle-r-line" class="text-red-500" style=" size: 32px;" />
                        <span class="nav-text text-red-800 hover:text-red-500 ">Logout</span>
                    </div>
                </a-menu-item>
            </a-menu>

            <div class="absolute bottom-0 w-full text-white p-4 border-t border-gray-700">
                <UserInfo :user="user" />
            </div>
        </a-layout-sider>
        <a-layout :style="{ marginLeft: '200px', height: '100svh', background: '#fff', overflow: 'auto' }">
            <div v-if="site" class="p-5 shadow-md flex gap-4">
                <img :src="site.logo_url" alt="site_logo" class="site-logo w-15 h-8 ">
                <span class=" !text-xl !font-semibold">New order</span>
            </div>
            <!-- <a-layout-header :style="{ background: '#fff', padding: 0 }" /> -->
            <!-- <a-layout-content :style="{ width: '100%', height: '100vh', margin: '24px 16px 0', overflow: 'initial' }"> -->
            <a-breadcrumb style="margin: 16px">
                <a-breadcrumb-item v-for="breadcrumb in breadcrumbList">{{ breadcrumb }}</a-breadcrumb-item>
            </a-breadcrumb>
            <div class="!m-4 h-full">
                <slot />
            </div>

            <!-- </a-layout-content> -->
        </a-layout>
    </a-layout>
</template>
<script setup>
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserInfo from '../user/UserInfo.vue';
import { useAuthStore } from '@/stores/auth';

defineProps({
    breadcrumbList: Array,
    site: Object
});

const menuItems = ref([
    {
        id: 1,
        name: 'Dashboard',
        url: '/dashboard',
        icon: 'mynaui:desktop',

    },
    {
        id: 2,
        name: 'Ip Whitelist',
        url: '/ip-whitelist',
        icon: 'hugeicons:location-03',
        permission: 'ip_whitelist_read'
    },
    {
        id: 3,
        name: 'User',
        url: '/user',
        icon: 'qlementine-icons:user-16',
        permission: 'user_read'
    },
    {
        id: 4,
        name: 'Group',
        url: '/group',
        icon: 'fluent:people-team-20-regular',
        permission: 'group_read'
    },
    {
        id: 5,
        name: 'Role',
        url: '/role',
        icon: 'solar:user-id-broken',
        permission: 'role_read'
    },
]);

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const user = auth.user;
// selectedKeys holds an array of active keys (we use the URL string)
const selectedKeys = ref([]);

const Logout = async () => {
    auth.logout();
}

// Filter the menu items based on user permissions
const filteredMenuItems = computed(() => {
    return menuItems.value.filter(menu => {
        if (!menu.permission) return true; // If there's no permission limit, show the item
        return auth.hasPermission(menu.permission); // Check if the user has permission for this menu item
    });
});

// On component mount, set the active menu based on current route
onMounted(() => {
    selectedKeys.value = [route.path];
});

// update the active menu item
watch(() => route.path, (newPath) => {
    selectedKeys.value = [newPath];
});

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
<style>
/* :where(.css-dev-only-do-not-override-1p3hq3p).ant-layout .ant-layout-sider {
    width: 220px !important;
    max-width: 220px !important;
} */
</style>