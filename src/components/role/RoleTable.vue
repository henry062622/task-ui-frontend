<template>
    <a-table :columns="columns" :data-source="roles" class="pt-4" bordered>
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'permissions' && record.permissions.length > 0">
                <div class="!space-y-3">
                    <a-tag v-for="(permission, index) in record.permissions" :key="index" color="green">
                        {{ formatPermissionName(permission.name) }}
                    </a-tag>
                </div>
            </template>

            <template v-if="column.dataIndex === 'action'">
                <EditOutlined @click="clickEditBtn(record)" class="!mr-2" />
                <a-popconfirm title="Sure to delete?" @confirm="handleDelete(record)">
                    <DeleteOutlined style="color: red;" />
                </a-popconfirm>
            </template>
        </template>
    </a-table>

    <EditRoleModal :visible="showEditModal" :permissionList="permissionList" :role="selectedRecord"
        @close="showEditModal = false" @updated="emit('refreshTable')"></EditRoleModal>
</template>

<script setup>
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { formatPermissionName } from '@/utils/format'
import EditRoleModal from './EditRoleModal.vue'
import { ref } from 'vue'
import api from '@/lib/axios'

const emit = defineEmits(['refreshTable'])

defineProps({
    roles: {
        type: Array,
        required: true
    },
    permissionList: {
        type: Array,
        required: true
    }
})

const showEditModal = ref(false);
const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name'
    },
    {
        title: 'Permissions',
        dataIndex: 'permissions',
        key: 'permissions'
    },
    {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        width: 100
    }
]
const selectedRecord = ref(null);

const clickEditBtn = (role) => {
    selectedRecord.value = role;
    showEditModal.value = true;
}

// Delete
const handleDelete = async (role) => {
    //First wait for api
    try {
        await api.delete(`/api/role/${role.id}`)
        emit('refreshTable')
    } catch (err) {
        console.error('Delete failed:', err)
    }
}
</script>
