<template>
    <DefaultLayout :breadcrumb-list="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <div class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn">Create</a-button>
                </div>

                <RoleTable :roles="roleList" @delete="handleDelete" :permissionList="permissionList"
                    @refreshTable="fetchRolelist" />
                <CreateRoleModal :visible="showModal" :permissionList="permissionList" @close="showModal = false"
                    @created="fetchRolelist" />

            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import api from '@/lib/axios'
import { onMounted, ref } from 'vue'
import RoleTable from '@/components/role/RoleTable.vue'
import CreateRoleModal from '@/components/role/CreateRoleModal.vue'

const breadcrumbList = ref(['Role', 'List'])
const roleList = ref([])
const permissionList = ref({})
const showModal = ref(false)

// 🧠 Modal control
const clickCreateBtn = () => { showModal.value = true }

// Fetch data
const fetchRolelist = async () => {
    const res = await api.get('/api/role')
    roleList.value = res.data.data
}

const fetchPermissionlist = async () => {
    const res = await api.get('/api/get-permission-list')
    permissionList.value = res.data.data
}

// 🔃 Init
onMounted(() => {
    fetchRolelist()
    fetchPermissionlist()
})
</script>
