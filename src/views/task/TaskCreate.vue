<template>
    <DefaultLayout :site="selectedSite">
        <div v-if="!selectedSite" class="flex h-full bg-white w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4 ">
            <!-- Select Site -->
            <SiteCardContainer class="!mt-10">
                <SiteCard v-for="website in websiteList" :website="website" @click="clickSite(website)"></SiteCard>
            </SiteCardContainer>
        </div>
        <div v-else class="flex h-auto bg-white w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4 ">
            <!-- create form  -->
            <TaskCreateComponent class="h-full" :website-list="websiteList" :website-id="selectedSite.id">
            </TaskCreateComponent>
        </div>
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import api from '@/lib/axios';
import { onMounted, ref } from 'vue';
import SiteCardContainer from '@/components/ui/SiteCardContainer.vue';
import SiteCard from '@/components/ui/SiteCard.vue';
import TaskCreateComponent from '@/components/task/TaskCreateComponent.vue';

const websiteList = ref([]);
const selectedSite = ref(null);

const clickSite = (site) => {
    selectedSite.value = site;
    // formState.value.website_id = site.id;
}

const fetchWebsitelist = async () => {
    const res = await api.get('/api/websites');
    websiteList.value = res.data.data;
}

// Init
onMounted(() => {
    fetchWebsitelist();
})
</script>