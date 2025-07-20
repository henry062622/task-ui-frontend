<template>
    <DefaultLayout :breadcrumbList="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <!-- Header with Create Button -->
                <div v-if="hasCreatePermission" class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn"> Create </a-button>
                </div>

                <IpWhitelistTable :data="data" :has-delete-permission="hasDeletePermission"
                    :has-edit-permission="hasEditPermission" :fetch-ip-whitelist="fetchIpWhitelist" />

                <CreateIpWhitelistModal :visible="showModal" @close="closeModel" @created="fetchIpWhitelist" />

                <!-- <Create v-model:showModal="showModal" @closePopupModel="closeModel"></Create> -->

            </div>
        </div>
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import { onMounted, ref } from 'vue';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth';
import IpWhitelistTable from '@/components/ip_whitelist/IpWhitelistTable.vue';
import CreateIpWhitelistModal from '@/components/ip_whitelist/CreateIpWhitelistModal.vue';

const breadcrumbList = ref(['Ip Whitelist', 'List']);

const auth = useAuthStore();

// State for buttons
const hasCreatePermission = ref(false);
const hasEditPermission = ref(false);
const hasDeletePermission = ref(false);

const formState = ref({
    ip_address: '',
    description: null
});

const errors = ref({
    ip_address: '',
});

const data = ref([]);
const showModal = ref(false);

const clickCreateBtn = () => {
    showModal.value = true;
}

const closeModel = () => {
    showModal.value = false;
}

const fetchIpWhitelist = async () => {
    await api.get('/api/ip-whitelist')
        .then(res => {
            data.value = res.data.data;
        })
}

onMounted(() => {
    hasCreatePermission.value = auth.hasPermission('ip_whitelist_create');
    hasEditPermission.value = auth.hasPermission('ip_whitelist_edit');
    hasDeletePermission.value = auth.hasPermission('ip_whitelist_delete');
    fetchIpWhitelist();
})
</script>