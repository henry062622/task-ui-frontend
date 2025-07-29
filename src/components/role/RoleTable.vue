<template>
    <a-table :columns="columns" :data-source="roles" :pagination="pagination" row-key="id" @change="handleTableChange"
        :loading="loading" class="pt-4" bordered>
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'permissions' && record.permissions.length > 0">
                <div class="!space-y-3">
                    <a-tag v-for="(permission, index) in record.permissions" :key="index" color="green">
                        <span v-if="isEnglish">{{ formatPermissionName(permission.name) }}</span>
                        <span v-else>{{ permission.th_name }}</span>

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

    <EditRoleModal :visible="showEditModal" :permissionList="permissionList" :role="selectedRecord"
        @close="showEditModal = false" @updated="emit('refreshTable')" :is-english="isEnglish"></EditRoleModal>
</template>

<script setup>
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { formatPermissionName } from '@/utils/format'
import EditRoleModal from './EditRoleModal.vue'
import { computed, ref, watch } from 'vue'
import api from '@/lib/axios'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['refreshTable'])

defineProps({
    roles: {
        type: Array,
        required: true
    },
    permissionList: {
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

const { locale, t } = useI18n()
const isEnglish = ref(locale.value === 'en')
const showEditModal = ref(false);
const columns = computed(() => [
    {
        title: t('name'),
        dataIndex: 'name',
        key: 'name'
    },
    {
        title: t('permissions'),
        dataIndex: 'permissions',
        key: 'permissions'
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

const clickEditBtn = (role) => {
    selectedRecord.value = role;
    showEditModal.value = true;
}

const handleTableChange = (pagination) => {
    emit('refreshTable', pagination.current)
};

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

watch(locale, val => {
    isEnglish.value = (val === 'en')
})
</script>
