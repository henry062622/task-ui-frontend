<template>
    <DefaultLayout>
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4 pt-10">
            <SiteCardContainer>
                <SiteCard v-for="website in websiteList" :website="website"></SiteCard>
            </SiteCardContainer>
        </div>
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import api from '@/lib/axios';
import { onMounted, ref } from 'vue';
import SiteCardContainer from '@/components/ui/SiteCardContainer.vue';
import SiteCard from '@/components/ui/SiteCard.vue';

const websiteList = ref([]);

const fetchWebsitelist = async () => {
    const res = await api.get('/api/websites');
    websiteList.value = res.data.data;
}

// Init
onMounted(() => {
    fetchWebsitelist();
})
</script>