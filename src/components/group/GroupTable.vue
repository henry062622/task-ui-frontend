<template>
    <a-table :columns="columns" :data-source="groups" :pagination="pagination" row-key="id" @change="handleTableChange"
        :loading="loading" class="pt-4" bordered>
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'users' && record.users.length > 0">
                <div class="!space-y-3">
                    <a-tag v-for="(user, index) in record.users" :key="index" color="geekblue">
                        {{ user.name }}
                    </a-tag>
                </div>
            </template>

            <template v-if="column.dataIndex === 'action'">
                <EditOutlined v-if="hasEditPermission" @click="clickEditBtn(record)" class="!mr-2" />
                <a-popconfirm v-if="hasDeletePermission" :title="$t('sureToDelete')" @confirm="handleDelete(record)">
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
import { computed, ref } from 'vue'
import api from '@/lib/axios'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['refreshTable'])

defineProps({
    groups: {
        type: Array,
        required: true
    },
    hasEditPermission: {
        type: Boolean,
        required: true
    },
    hasDeletePermission: {
        type: Boolean,
        required: true
    },
    pagination: {
        type: Object
    },
    loading: {
        type: Boolean
    }
})

const { t } = useI18n()
const showEditModal = ref(false);
const columns = computed(() => [
    {
        title: t('name'),
        dataIndex: 'name',
        key: 'name'
    },
    {
        title: t('users'),
        dataIndex: 'users',
        key: 'users'
    },
    {
        title: t('action'),
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        width: 100
    }
])
const selectedRecord = ref(null);

const clickEditBtn = (group) => {
    selectedRecord.value = group;
    showEditModal.value = true;
}

const handleTableChange = (pagination) => {
    emit('refreshTable', pagination.current)
};

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
