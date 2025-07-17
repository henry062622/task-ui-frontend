<template>
    <DefaultLayout :breadcrumb-list="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <div class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn">Create</a-button>
                </div>

                <GroupTable :groups="groupList" @refreshTable="fetchGrouplist" />
                <CreateGroupModal :visible="showModal" @close="showModal = false" @created="fetchGrouplist" />

            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import api from '@/lib/axios'
import { onMounted, ref } from 'vue'
import GroupTable from '@/components/group/GroupTable.vue'
import CreateGroupModal from '@/components/group/CreateGroupModal.vue'

const breadcrumbList = ref(['Group', 'List'])
const groupList = ref([]);
const showModal = ref(false);

// Modal control
const clickCreateBtn = () => { showModal.value = true };

// Fetch data
const fetchGrouplist = async () => {
    const res = await api.get('/api/group');
    groupList.value = res.data.data;
}

// Init
onMounted(() => {
    fetchGrouplist();
})
</script>
