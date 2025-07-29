<template>
    <DefaultLayout :breadcrumb-list="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <div v-if="hasCreatePermission" class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn">{{ $t('create') }}</a-button>
                </div>

                <a-input-search v-model:value="searchQuery" :placeholder="$t('searchByGroupName')"
                    @search="handleSearch" allow-clear style="width: 250px" />

                <GroupTable :groups="groupList" @refreshTable="fetchGrouplist" :has-edit-permission="hasEditPermission"
                    :has-delete-permission="hasDeletePermission" :pagination="pagination" :loading="loading" />
                <CreateGroupModal :visible="showModal" @close="showModal = false" @created="fetchGrouplist" />

            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import api from '@/lib/axios'
import { onMounted, reactive, ref } from 'vue'
import GroupTable from '@/components/group/GroupTable.vue'
import CreateGroupModal from '@/components/group/CreateGroupModal.vue'
import { useAuthStore } from '@/stores/auth'

const breadcrumbList = ref(['group', 'list'])
const groupList = ref([]);
const showModal = ref(false);

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
const clickCreateBtn = () => { showModal.value = true };

const handleSearch = () => {
    fetchGrouplist(1);
}

const fetchGrouplist = async (page = 1) => {
    loading.value = true;
    try {
        const res = await api.get('/api/group', {
            params: {
                page,
                search: searchQuery.value
            }
        });

        groupList.value = res.data.data.data;
        pagination.total = res.data.data.total;
        pagination.current = res.data.data.current_page;
    } catch (err) {
        console.error('Fetch error', err);
    } finally {
        loading.value = false;
    }
};

// Init
onMounted(() => {
    hasCreatePermission.value = auth.hasPermission('group_create');
    hasEditPermission.value = auth.hasPermission('group_edit');
    hasDeletePermission.value = auth.hasPermission('group_delete');
    fetchGrouplist();
})
</script>
