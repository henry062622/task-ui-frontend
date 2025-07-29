<template>
    <DefaultLayout :breadcrumb-list="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-2 rounded-xl shadow-2xl p-4 pt-10">
            <span class=" text-2xl !font-semibold">{{ $t('setting') }}</span>
            <p class=" text-gray-500 !font-medium">{{ $t('manage_ur_pf_and_acc_settings') }}</p>

            <div class="setting-container flex h-full">
                <a-menu id="setting-sidebar" class=" !w-1/4 h-full" mode="inline" :selectedKeys="selectedKeys"
                    @update:selectedKeys="onSelect">
                    <a-menu-item v-for="menu in menuItems" :key="menu.key">
                        <span class="nav-text">{{ menu.name }}</span>
                    </a-menu-item>
                </a-menu>
                <div id="content" class="!w-3/4 pl-5">
                    <EditUserProfile v-if="isProfile" :user="user"></EditUserProfile>
                    <PasswordChange v-else></PasswordChange>
                </div>
            </div>
        </div>
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import api from '@/lib/axios';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth'
import EditUserProfile from '@/components/user/EditUserProfile.vue'
import PasswordChange from '@/components/user/PasswordChange.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const breadcrumbList = ref(['user', 'setting'])
const auth = useAuthStore();
const user = auth.user;
const selectedKeys = ref(['1']);
const isProfile = ref(true);

const menuItems = computed(() => [
    {
        key: '1',
        name: t('profile')
    },
    {
        key: '2',
        name: t('password'),
        url: '/ip-whitelist'
    },
]);

function onSelect(keys) {
    selectedKeys.value = keys;
    if (keys == '2') {
        isProfile.value = false;
    } else {
        isProfile.value = true;
    }
}

</script>