<template>
    <DefaultLayout :breadcrumbList="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <!-- Header with Create Button -->
                <div v-if="hasCreatePermission" class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn"> {{ $t('create') }} </a-button>
                </div>

                <a-input-search v-model:value="searchQuery" :placeholder="$t('searchByIpAddress')"
                    @search="handleSearch" allow-clear style="width: 250px" />

                <IpWhitelistTable :data="data" :has-delete-permission="hasDeletePermission"
                    :has-edit-permission="hasEditPermission" :fetch-ip-whitelist="fetchIpWhitelist"
                    :pagination="pagination" :loading="loading" />

                <CreateIpWhitelistModal :visible="showModal" @close="closeModel" @created="fetchIpWhitelist" />

                <!-- <Create v-model:showModal="showModal" @closePopupModel="closeModel"></Create> -->

            </div>
        </div>
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import { onMounted, reactive, ref } from 'vue';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth';
import IpWhitelistTable from '@/components/ip_whitelist/IpWhitelistTable.vue';
import CreateIpWhitelistModal from '@/components/ip_whitelist/CreateIpWhitelistModal.vue';

const breadcrumbList = ref(['ipWhitelist', 'list']);

const auth = useAuthStore();

// State for buttons
const hasCreatePermission = ref(false);
const hasEditPermission = ref(false);
const hasDeletePermission = ref(false);

const loading = ref(false);
const searchQuery = ref('');
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: false
});

const data = ref([]);
const showModal = ref(false);

const clickCreateBtn = () => {
    showModal.value = true;
}

const closeModel = () => {
    showModal.value = false;
}

const handleSearch = () => {
    fetchIpWhitelist(1);
}

const fetchIpWhitelist = async (page = 1) => {
    loading.value = true;
    try {
        const res = await api.get('/api/ip-whitelist', {
            params: {
                page,
                search: searchQuery.value
            }
        });

        data.value = res.data.data.data;
        pagination.total = res.data.data.total;
        pagination.current = res.data.data.current_page;
    } catch (err) {
        console.error('Fetch error', err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    hasCreatePermission.value = auth.hasPermission('ip_whitelist_create');
    hasEditPermission.value = auth.hasPermission('ip_whitelist_edit');
    hasDeletePermission.value = auth.hasPermission('ip_whitelist_delete');
    fetchIpWhitelist();
})
</script>