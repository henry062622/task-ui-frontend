<template>
    <a-table :columns="columns" :data-source="groups" class="pt-4" bordered>
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'users' && record.users.length > 0">
                <div class="!space-y-3">
                    <a-tag v-for="(user, index) in record.users" :key="index" color="geekblue">
                        {{ user.name }}
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

    <EditGroupModal :visible="showEditModal" :group="selectedRecord" @close="showEditModal = false"
        @updated="emit('refreshTable')"></EditGroupModal>
</template>

<script setup>
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import EditGroupModal from './EditGroupModal.vue'
import { ref } from 'vue'
import api from '@/lib/axios'

const emit = defineEmits(['refreshTable'])

defineProps({
    groups: {
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
        title: 'Users',
        dataIndex: 'users',
        key: 'users'
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

const clickEditBtn = (group) => {
    selectedRecord.value = group;
    showEditModal.value = true;
}

// Delete
const handleDelete = async (group) => {
    //First wait for api
    try {
        await api.delete(`/api/group/${group.id}`)
        emit('refreshTable')
    } catch (err) {
        console.error('Delete failed:', err)
    }
}
</script>
