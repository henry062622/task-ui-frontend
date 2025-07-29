<template>
    <a-table :columns="columns" :data-source="users" :pagination="pagination" row-key="id" :loading="loading"
        @change="handleTableChange" class="pt-4" bordered>
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'role' && record.role">
                <span>{{ record.role.name }}</span>
            </template>

            <template v-if="column.dataIndex === 'group' && record.group">
                <span>{{ record.group.name }}</span>
            </template>

            <template v-if="column.dataIndex === 'websites' && record.websites.length > 0">
                <div class="!space-y-3">
                    <a-tag v-for="(website, index) in record.websites" :key="index" color="geekblue">
                        {{ website.name }}
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

    <EditUserModal :visible="showEditModal" :group-list="groupList" :website-list="websiteList" :user="selectedRecord"
        :role-list="roleList" @close="showEditModal = false" @updated="emit('refreshTable')"></EditUserModal>
</template>

<script setup>
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { computed, ref } from 'vue'
import EditUserModal from './EditUserModal.vue'
import api from '@/lib/axios'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['refreshTable'])

defineProps({
    users: {
        type: Array,
        required: true
    },
    groupList: {
        type: Array,
        required: true
    },
    websiteList: {
        type: Array,
        required: true
    },
    roleList: {
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
        key: 'name',
    },
    {
        title: t('email'),
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: t('role'),
        dataIndex: 'role',
        key: 'role',
    },
    {
        title: t('group'),
        dataIndex: 'group',
        key: 'group',
    },
    {
        title: t('websites'),
        dataIndex: 'websites',
        key: 'websites',
    },
    {
        title: t('action'),
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        width: 100,
    },
])
const selectedRecord = ref(null);

const clickEditBtn = (user) => {
    selectedRecord.value = user;
    showEditModal.value = true;
}

// Delete
const handleDelete = async (user) => {
    //First wait for api
    try {
        await api.delete(`/api/user/${user.id}`)
        emit('refreshTable')
    } catch (err) {
        console.error('Delete failed:', err)
    }
}

const handleTableChange = (pagination) => {
    emit('refreshTable', pagination.current)
};
</script>
