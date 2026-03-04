<template>
  <DefaultLayout :site="selectedSite">
    <div v-if="!showUnavailablePopup && !selectedSite"
      class="flex h-full bg-white w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
      <!-- search box -->
      <div class="flex justify-end mb-4">
        <a-input-search v-model:value="searchQuery" :placeholder="$t('search_by_name')" @search="handleSearch"
          allow-clear style="width: 250px" />
      </div>
      <!-- Select Site -->
      <SiteCardContainer class="!mt-10">
        <SiteCard v-for="website in filteredWebsites" :key="website.id" :website="website" @click="clickSite(website)">
        </SiteCard>
      </SiteCardContainer>
    </div>
    <div v-else-if="!showUnavailablePopup && selectedSite"
      class="flex h-auto bg-white w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
      <!-- create form  -->
      <TaskCreateComponent class="h-full" :website-list="websiteList" :website-id="selectedSite.id" :user-id="user.id"
        :user-name="user.name">
      </TaskCreateComponent>
    </div>

    <a-modal v-model:open="showUnavailablePopup" :title="unavailableMessage" :closable="false" :mask-closable="false"
      :keyboard="false" centered>
      <template #footer>
        <a-button type="primary" @click="redirectToDashboard">OK</a-button>
      </template>
    </a-modal>
  </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import api from '@/lib/axios'
import { computed, onMounted, ref } from 'vue'
import SiteCardContainer from '@/components/ui/SiteCardContainer.vue'
import SiteCard from '@/components/ui/SiteCard.vue'
import TaskCreateComponent from '@/components/task/TaskCreateComponent.vue'
import { useAuthStore } from '@/stores/auth'
import { loadDraftFromIndexed, saveDraft } from '@/lib/indexdb'
import router from '@/router'
import { useRoute } from 'vue-router'

const websiteList = ref([])
const selectedSite = ref(null)

const auth = useAuthStore()
const user = auth.user
const route = useRoute()
const draftKey = `taskFormDraft_user_${user.id}`
const showUnavailablePopup = ref(true)
const unavailableMessage = 'ตอนนี้ไม่สามารถใช้งานได้, เตรียมตัวย้ายไปยังระบบใหม่เร็วๆ นี'

const searchQuery = ref('')

const filteredWebsites = computed(() => {
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return websiteList.value

  return websiteList.value.filter((w) => {
    const name = (w?.name || '').toLowerCase()
    return name.includes(q)
  })
})

function handleSearch(value) {
  searchQuery.value = value
}

const clickSite = async (site) => {
  selectedSite.value = site
  // formState.value.website_id = site.id;
  const draft = await loadDraftFromIndexed(draftKey)
  if (route.query.mode === 'copy' && draft?.__mode === 'copy') {
    await saveDraft(draftKey, { ...draft, website_id: site.id })
  }
}

const fetchWebsitelist = async () => {
  const res = await api.get('/api/websites')
  websiteList.value = res.data.data
}

const loadDraft = async () => {
  const draft = await loadDraftFromIndexed(draftKey)
  if (draft && draft?.__mode !== 'copy' && route.query.mode !== 'copy') {
    try {
      selectedSite.value = websiteList.value.find((d) => d.id == draft.website_id)
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
}

const init = async () => {
  await fetchWebsitelist()
  loadDraft()
}

const redirectToDashboard = () => {
  showUnavailablePopup.value = false
  router.replace('/dashboard')
}

// Init
onMounted(() => {
  if (!showUnavailablePopup.value) {
    init()
  }
})
</script>
