<template>
    <DefaultLayout :breadcrumb-list="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <div v-if="hasCreatePermission" class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn">Create</a-button>
                </div>

                <GroupTable :groups="groupList" @refreshTable="fetchGrouplist" :has-edit-permission="hasEditPermission"
                    :has-delete-permission="hasDeletePermission" />
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
import { useAuthStore } from '@/stores/auth'

const breadcrumbList = ref(['Group', 'List'])
const groupList = ref([]);
const showModal = ref(false);

const auth = useAuthStore();

// State for buttons
const hasCreatePermission = ref(false);
const hasEditPermission = ref(false);
const hasDeletePermission = ref(false);

// Modal control
const clickCreateBtn = () => { showModal.value = true };

// Fetch data
const fetchGrouplist = async () => {
    const res = await api.get('/api/group');
    groupList.value = res.data.data;
}

// Init
onMounted(() => {
    hasCreatePermission.value = auth.hasPermission('group_create');
    hasEditPermission.value = auth.hasPermission('group_edit');
    hasDeletePermission.value = auth.hasPermission('group_delete');
    fetchGrouplist();
})
</script>
