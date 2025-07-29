<template>
    <div class="ip-whitelist-table">
        <a-table :columns="columns" :data-source="data" class="pt-4" :pagination="pagination" row-key="id"
            @change="handleTableChange" :loading="loading" bordered>
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'creator'">
                    <span>{{ record.creator.name }}</span>
                </template>
                <template v-if="column.dataIndex === 'action'">
                    <EditOutlined v-if="hasEditPermission" @click="clickEditBtn(record)" class="!mr-2" />
                    <a-popconfirm v-if="hasDeletePermission" :title="$t('sureToDelete')"
                        @confirm="deleteIpWhitelist(record.id)">
                        <DeleteOutlined style="color: red;" />
                    </a-popconfirm>
                </template>
            </template>
        </a-table>

        <EditIpWhitelistModal :visible="showModal" :ip-whitelist="selectedRecord" @close="closeModel"
            @updated="fetchIpWhitelist" />
    </div>
</template>

<script setup>
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import { computed, ref } from 'vue';
import api from '@/lib/axios';
import EditIpWhitelistModal from './EditIpWhitelistModal.vue';
import { useI18n } from 'vue-i18n'

const props = defineProps({
    data: Array,
    pagination: Object,
    hasDeletePermission: Boolean,
    hasEditPermission: Boolean,
    fetchIpWhitelist: Function,
    loading: Boolean,
});

const { t } = useI18n()

const columns = computed(() => [
    {
        title: t('ipAddress'),
        dataIndex: 'ip_address',
        key: 'ip_address',
    },
    {
        title: t('description'),
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: t('created_by'),
        dataIndex: 'creator',
        key: 'creator',
    },
    {
        title: t('action'),
        dataIndex: 'action',
        key: 'action',
    },
])

const selectedRecord = ref(null);
const showModal = ref(false);

const clickEditBtn = (record) => {
    selectedRecord.value = record;
    showModal.value = true;
}

const closeModel = () => {
    showModal.value = false;
}

const deleteIpWhitelist = async (id) => {
    try {
        await api.delete(`/api/ip-whitelist/${id}`);
        props.fetchIpWhitelist();
    } catch (err) {
        console.error('Error deleting IP whitelist:', err);
    }
};

const handleTableChange = (pagination) => {
    props.fetchIpWhitelist(pagination.current);
};
</script>
