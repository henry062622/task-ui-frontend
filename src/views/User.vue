<template>
    <DefaultLayout :breadcrumb-list="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <div v-if="hasCreatePermission" class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn">Create</a-button>
                </div>

                <div class="flex gap-4 !mb-4">
                    <a-input-search v-model:value="searchQuery" placeholder="Search by name or email"
                        @search="handleSearch" allow-clear style="width: 250px" />

                    <a-select v-model:value="filters.role" placeholder="Select Role" @change="handleFilter" allow-clear
                        style="width: 220px">
                        <a-select-option v-for="role in roleList" :key="role.id" :value="role.id"> {{ role.name
                            }} </a-select-option>
                    </a-select>

                    <a-select v-model:value="filters.group" placeholder="Select Group" @change="handleFilter"
                        allow-clear style="width: 220px">
                        <a-select-option v-for="group in groupList" :key="group.id" :value="group.id"> {{ group.name
                            }} </a-select-option>
                    </a-select>
                </div>

                <UserTable :users="userList" @refreshTable="fetchUserlist" :groupList="groupList"
                    :website-list="websiteList" :role-list="roleList" :has-delete-permission="hasDeletePermission"
                    :has-edit-permission="hasEditPermission" :pagination="pagination" :loading="loading" />
                <CreateUserModal :visible="showModal" :groupList="groupList" :website-list="websiteList"
                    :role-list="roleList" @close="showModal = false" @created="fetchUserlist" />

            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import api from '@/lib/axios'
import { onMounted, reactive, ref } from 'vue'
import UserTable from '@/components/user/UserTable.vue'
import CreateUserModal from '@/components/user/CreateUserModal.vue'
import { useAuthStore } from '@/stores/auth'

const breadcrumbList = ref(['User', 'List'])
const userList = ref([]);
const showModal = ref(false);
const websiteList = ref([]);
const groupList = ref([]);
const roleList = ref([]);

const loading = ref(false);
const searchQuery = ref('');
const filters = reactive({ role: null, group: null });
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: false
});

const auth = useAuthStore();

// State for buttons
const hasCreatePermission = ref(false);
const hasEditPermission = ref(false);
const hasDeletePermission = ref(false);

// Modal control
const clickCreateBtn = () => { showModal.value = true };

const handleSearch = () => {
    fetchUserlist(1);
}

const handleFilter = () => {
    fetchUserlist(1);
}

const fetchUserlist = async (page = 1) => {
    loading.value = true;
    try {
        const res = await api.get('/api/users', {
            params: {
                page,
                search: searchQuery.value,
                role: filters.role,
                group: filters.group
            }
        });

        userList.value = res.data.data.data;
        pagination.total = res.data.data.total;
        pagination.current = res.data.data.current_page;
    } catch (err) {
        console.error('Fetch error', err);
    } finally {
        loading.value = false;
    }
};

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
    hasCreatePermission.value = auth.hasPermission('user_create');
    hasEditPermission.value = auth.hasPermission('user_edit');
    hasDeletePermission.value = auth.hasPermission('user_delete');
    fetchUserlist();
    if (hasEditPermission.value || hasCreatePermission.value) {
        fetchGrouplist();
        fetchWebsitelist();
        fetchRoleList();
    }
})
</script>
