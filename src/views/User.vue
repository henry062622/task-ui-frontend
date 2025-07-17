<template>
    <DefaultLayout :breadcrumb-list="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <div class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn">Create</a-button>
                </div>

                <UserTable :users="userList" @refreshTable="fetchUserlist" :groupList="groupList"
                    :website-list="websiteList" :role-list="roleList" />
                <CreateUserModal :visible="showModal" :groupList="groupList" :website-list="websiteList"
                    :role-list="roleList" @close="showModal = false" @created="fetchUserlist" />

            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import api from '@/lib/axios'
import { onMounted, ref } from 'vue'
import UserTable from '@/components/user/UserTable.vue'
import CreateUserModal from '@/components/user/CreateUserModal.vue'

const breadcrumbList = ref(['User', 'List'])
const userList = ref([]);
const showModal = ref(false);
const websiteList = ref([]);
const groupList = ref([]);
const roleList = ref([]);

// Modal control
const clickCreateBtn = () => { showModal.value = true };

// Fetch data
const fetchUserlist = async () => {
    const res = await api.get('/api/users');
    userList.value = res.data.data;
}

const fetchGrouplist = async () => {
    const res = await api.get('/api/get-group-name-list');
    groupList.value = res.data.data;
}

const fetchWebsitelist = async () => {
    const res = await api.get('/api/get-website-name-list');
    websiteList.value = res.data.data;
}

const fetchRoleList = async () => {
    const res = await api.get('/api/role/get-name-list');
    roleList.value = res.data.data;
}

// Init
onMounted(() => {
    fetchUserlist();
    fetchGrouplist();
    fetchWebsitelist();
    fetchRoleList();
})
</script>
