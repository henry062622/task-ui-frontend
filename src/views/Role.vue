<template>
    <DefaultLayout :breadcrumb-list="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <div v-if="hasCreatePermission" class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn">{{ $t('create') }}</a-button>
                </div>

                <a-input-search v-model:value="searchQuery" :placeholder="$t('searchByRoleName')" @search="handleSearch"
                    allow-clear style="width: 250px" />

                <RoleTable :roles="roleList" :permissionList="permissionList" :has-edit-permission="hasEditPermission"
                    :has-delete-permission="hasDeletePermission" @refreshTable="fetchRolelist" :pagination="pagination"
                    :loading="loading" />
                <CreateRoleModal :visible="showModal" :permissionList="permissionList" @close="showModal = false"
                    @created="fetchRolelist" />

            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import api from '@/lib/axios'
import { onMounted, reactive, ref } from 'vue'
import RoleTable from '@/components/role/RoleTable.vue'
import CreateRoleModal from '@/components/role/CreateRoleModal.vue'
import { useAuthStore } from '@/stores/auth'

const breadcrumbList = ref(['role', 'list'])
const roleList = ref([])
const permissionList = ref({})
const showModal = ref(false)

const loading = ref(false);
const searchQuery = ref('');
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
const clickCreateBtn = () => { showModal.value = true }

const handleSearch = () => {
    fetchRolelist(1);
}

const fetchRolelist = async (page = 1) => {
    loading.value = true;
    try {
        const res = await api.get('/api/role', {
            params: {
                page,
                search: searchQuery.value
            }
        });

        roleList.value = res.data.data.data;
        pagination.total = res.data.data.total;
        pagination.current = res.data.data.current_page;
    } catch (err) {
        console.error('Fetch error', err);
    } finally {
        loading.value = false;
    }
};

const fetchPermissionlist = async () => {
    const res = await api.get('/api/get-permission-list')
    permissionList.value = res.data.data
}

// Init
onMounted(() => {
    hasCreatePermission.value = auth.hasPermission('role_create');
    hasEditPermission.value = auth.hasPermission('role_edit');
    hasDeletePermission.value = auth.hasPermission('role_delete');
    fetchRolelist()
    if (hasCreatePermission || hasEditPermission) {
        fetchPermissionlist()
    }
})
</script>
