<template>
    <a-layout has-sider :style="{ width: '100%', height: '100svh', background: '#fff' }">
        <a-layout-sider :style="{ overflow: 'auto', height: '100%', position: 'fixed', left: 0, top: 0, bottom: 0, }">
            <div class="w-full text-white p-4 border-b border-gray-700 text-center text-lg !mb-4 !font-bold">
                {{ $t('task_management') }}
            </div>
            <!-- <div class="!m-4 h-8 flex justify-center items-center rounded-2xl bg-[rgba(255,255,255,0.2)]"> -->
            <!-- <h3 class="text-white">Task Management</h3> -->
            <!-- </div> -->
            <a-menu :selectedKeys="selectedKeys" theme="dark" mode="inline" @update:selectedKeys="onSelect">
                <a-menu-item v-for="(menu, index) in filteredMenuItems" :key="menu.url">
                    <div class="flex items-center gap-3">
                        <Icon :icon="menu.icon" style="color: #fff; size: 32px;" />
                        <span class="nav-text">{{ $t(menu.name) }}</span>
                    </div>
                </a-menu-item>
            </a-menu>

            <!-- <div class="absolute bottom-0 w-full text-white p-4 border-t border-gray-700">

            </div> -->
        </a-layout-sider>
        <a-layout :style="{ marginLeft: '200px', height: '100svh', background: '#fff', overflow: 'auto' }">
            <div class="p-5 shadow-md flex gap-4">
                <div v-if="site" class="flex gap-4">
                    <img :src="site.logo_url" alt="site_logo" class="site-logo w-15 h-8 ">
                    <span class=" !text-xl !font-semibold">{{ $t('new_order') }}</span>
                </div>
                <div class="flex flex-1 justify-end items-center gap-4">
                    <a-switch :checked="isEnglish" @change="toggleLanguage" class="flag-switch" />
                    <a-divider type="vertical" class="!h-full" />
                    <a-dropdown class=" cursor-pointer " :trigger="['click']">
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
            <!-- <a-layout-header :style="{ background: '#fff', padding: 0 }" /> -->
            <!-- <a-layout-content :style="{ width: '100%', height: '100vh', margin: '24px 16px 0', overflow: 'initial' }"> -->
            <a-breadcrumb style="margin: 16px">
                <a-breadcrumb-item v-for="breadcrumb in breadcrumbList">{{ $t(breadcrumb) }}</a-breadcrumb-item>
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
import { useI18n } from 'vue-i18n';
import { DownOutlined } from '@ant-design/icons-vue';

defineProps({
    breadcrumbList: Array,
    site: Object
});

const menuItems = ref([
    {
        id: 1,
        name: 'dashboard',
        url: '/dashboard',
        icon: 'mynaui:desktop',

    },
    // {
    //     id: 2,
    //     name: 'ip_whitelist',
    //     url: '/ip-whitelist',
    //     icon: 'hugeicons:location-03',
    //     permission: 'ip_whitelist_read'
    // },
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
]);

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { locale, t } = useI18n()
// reactive for switch position
const isEnglish = ref(locale.value === 'en')
const user = auth.user;
// selectedKeys holds an array of active keys (we use the URL string)
const selectedKeys = ref([]);

const Logout = async () => {
    auth.logout();
}

const goToProfilePage = () => {
    router.push('/setting');
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

// On component mount, set the active menu based on current route
onMounted(() => {
    selectedKeys.value = [route.path];
});

// update the active menu item
watch(() => route.path, (newPath) => {
    selectedKeys.value = [newPath];
});

// if you want the switch to reflect outside changes to locale:
watch(locale, val => {
    isEnglish.value = (val === 'en')
    console.log(isEnglish.value)
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
    /* size it to fit your flags */
    width: 50px;
    height: 23px;
    /* default (unchecked) = Thai flag */
    background-image: url('/th.png');
    background-size: cover;
    background-position: center;
    border: none;
    /* remove the grey track if you like */
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
    /* center it vertically */
    left: 3px;
    /* offset so it slides nicely */
    transition: left .2s;
}

/* make sure the handle slides all the way */
.flag-switch.ant-switch-checked .ant-switch-handle {
    left: 29px;
    /* = width(track) - width(handle) - margin */
}
</style>