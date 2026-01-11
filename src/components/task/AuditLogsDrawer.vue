<template>
  <a-drawer :open="visible" :title="$t('audit_logs')" placement="right" :width="560" @close="$emit('close')"
    :destroyOnClose="true">
    <div class="flex items-center justify-between !mb-10">
      <div class="text-sm text-gray-500">
        {{ $t('total') }}: <b>{{ meta.total }}</b>
      </div>
      <div class="flex items-center gap-2">
        <a-button type="link" size="small" @click="reload" :loading="loading">
          {{ $t('refresh') }}
        </a-button>
      </div>
    </div>

    <a-empty v-if="!loading && items.length === 0" :description="$t('no_data')" />

    <a-timeline v-else>
      <a-timeline-item v-for="log in items" :key="log.id">
        <!-- ASSIGN: simple text row (no card) -->
        <template v-if="['assign', 'status'].includes(log.type)">
          <div class="flex flex-col gap-1">
            <div class="text-sm">
              {{ log.changes?.message || '—' }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formatDateTime(log.created_at) }}
            </div>
          </div>
        </template>

        <!-- submit: show message + submitted text + image thumbnails only + summary of other files -->
        <template v-else-if="log.type === 'submit'">
          <a-card :bordered="true" size="small">
            <template #title>
              <div class="flex items-center gap-2">
                <a-tag color="purple" class="uppercase !mb-0">submit</a-tag>
              </div>
            </template>
            <template #extra>
              <span class="text-xs text-gray-500">{{ formatDateTime(log.created_at) }}</span>
            </template>

            <div class="text-xs text-gray-600 !mb-2">
              {{ log.changes?.message }}
            </div>

            <!-- Submitted text -->
            <div v-if="log.changes?.submitted_text" class="!mb-3">
              <div class="font-medium text-xs !mb-2">{{ $t('text_submission') }}</div>
              <div class="rounded-md bg-gray-50 p-2 text-xs whitespace-pre-wrap">
                {{ log.changes.submitted_text }}
              </div>
            </div>

            <!-- Images only -->
            <div v-if="onlyImages(log.changes?.files).length">
              <div class="font-medium text-xs !mb-2">{{ $t('images') }}</div>
              <div class="flex gap-2 flex-wrap">
                <a-image v-for="(u, i) in onlyImages(log.changes.files)" :key="i" :src="u"
                  class="!w-[60px] aspect-[4/5] rounded-lg overflow-hidden !border !border-gray-200 !bg-white" />
              </div>
            </div>

            <!-- Non-image summary -->
            <div v-if="nonImageSummary(log.changes?.files).total" class="!mt-2">
              <div class="font-medium text-xs !mb-2">{{ $t('other_files_submitted') }}</div>
              <div class="flex items-center gap-2 flex-wrap text-xs">
                <a-tag v-if="nonImageSummary(log.changes.files).video" color="geekblue">
                  {{ $t('videos_n', { n: nonImageSummary(log.changes.files).video }) }}
                </a-tag>
                <a-tag v-if="nonImageSummary(log.changes.files).document" color="gold">
                  {{ $t('documents_n', { n: nonImageSummary(log.changes.files).document }) }}
                </a-tag>
                <a-tag v-if="nonImageSummary(log.changes.files).archive" color="red">
                  {{ $t('archives_n', { n: nonImageSummary(log.changes.files).archive }) }}
                </a-tag>
                <a-tag v-if="nonImageSummary(log.changes.files).audio" color="purple">
                  {{ $t('audios_n', { n: nonImageSummary(log.changes.files).audio }) }}
                </a-tag>
                <a-tag v-if="nonImageSummary(log.changes.files).other" color="default">
                  {{ $t('others_n', { n: nonImageSummary(log.changes.files).other }) }}
                </a-tag>
              </div>
            </div>
          </a-card>
        </template>

        <template v-else-if="log.type === 'revision'">
          <a-card :bordered="true" size="small">
            <template #title>
              <div class="flex items-center gap-2">
                <a-tag color="orange" class="uppercase !mb-0">revision</a-tag>
              </div>
            </template>
            <template #extra>
              <span class="text-xs text-gray-500">{{ formatDateTime(log.created_at) }}</span>
            </template>

            <div class="text-xs text-gray-600 !mb-2">
              {{ log.changes?.message }}
              <template v-if="log.changes?.status?.label_new">
                ({{ log.changes.status.label_new }})
              </template>
            </div>

            <div v-if="log.changes?.reason">
              <div class="font-medium text-xs !mb-2">{{ $t('revision_reason') }}</div>
              <div class="rounded-md bg-gray-50 p-2 text-xs whitespace-pre-wrap">
                {{ log.changes.reason }}
              </div>
            </div>
          </a-card>
        </template>

        <!-- OTHER TYPES: full card with diffs (responsive + FULL text for each field) -->
        <template v-else>
          <a-card :bordered="true" size="small" class="w-full">
            <template #title>
              <div class="flex items-center gap-2 min-w-0">
                <a-tag color="blue" class="uppercase !mb-0 shrink-0">{{ log.type }}</a-tag>
                <span class="text-gray-500 shrink-0">#{{ log.id }}</span>
              </div>
            </template>

            <template #extra>
              <span class="text-xs text-gray-500 whitespace-nowrap">
                {{ formatDateTime(log.created_at) }}
              </span>
            </template>

            <div class="text-xs text-gray-600 !mb-3">
              {{ $t('by') }}: <b>{{ log.changes?.updated_by || '-' }}</b>
            </div>

            <!-- ✅ Diff as responsive columns (not rows) -->
            <div v-if="log.changes?.diff" class="grid grid-cols-1 gap-3">
              <template v-for="(val, field) in log.changes.diff" :key="field">
                <div class="rounded-lg border border-gray-200 bg-white p-3 min-w-0 w-full">
                  <!-- ✅ Field title (FULL) -->
                  <div class="mb-2 text-sm font-semibold text-gray-700 whitespace-normal break-words">
                    {{ humanize(field) }}
                  </div>

                  <!-- ✅ Special case: files_required_for_task: { added: [], removed: [] } -->
                  <template v-if="field === 'files_required_for_task'">
                    <!-- ADDED BLOCK -->
                    <div v-if="Array.isArray(val?.added) && val.added.length" class="mb-4">
                      <div class="text-[11px] text-gray-500 mb-2">
                        <span class="font-semibold text-green-600">+ {{ $t('added') }}</span>
                        <span class="text-gray-400">({{ val.added.length }})</span>
                      </div>

                      <!-- Images -->
                      <div v-if="onlyImages(val.added).length">
                        <div class="font-medium text-xs !mb-2">{{ $t('images') }}</div>
                        <div class="flex gap-2 flex-wrap">
                          <a-image v-for="(u, i) in onlyImages(val.added)" :key="`frft-add-img-${i}`" :src="u"
                            class="!w-[60px] aspect-[4/5] rounded-lg overflow-hidden !border !border-gray-200 !bg-white" />
                        </div>
                      </div>

                      <!-- Non-image summary -->
                      <div v-if="nonImageSummary(val.added).total" class="!mt-2">
                        <div class="font-medium text-xs !mb-2">{{ $t('other_files') }}</div>
                        <div class="flex items-center gap-2 flex-wrap text-xs">
                          <a-tag v-if="nonImageSummary(val.added).video" color="geekblue">
                            {{ $t('videos_n', { n: nonImageSummary(val.added).video }) }}
                          </a-tag>
                          <a-tag v-if="nonImageSummary(val.added).document" color="gold">
                            {{ $t('documents_n', { n: nonImageSummary(val.added).document }) }}
                          </a-tag>
                          <a-tag v-if="nonImageSummary(val.added).archive" color="red">
                            {{ $t('archives_n', { n: nonImageSummary(val.added).archive }) }}
                          </a-tag>
                          <a-tag v-if="nonImageSummary(val.added).audio" color="purple">
                            {{ $t('audios_n', { n: nonImageSummary(val.added).audio }) }}
                          </a-tag>
                          <a-tag v-if="nonImageSummary(val.added).other" color="default">
                            {{ $t('others_n', { n: nonImageSummary(val.added).other }) }}
                          </a-tag>
                        </div>
                      </div>
                    </div>

                    <!-- REMOVED BLOCK -->
                    <div v-if="Array.isArray(val?.removed) && val.removed.length">
                      <div class="text-[11px] text-gray-500 mb-2">
                        <span class="font-semibold text-red-600">- {{ $t('removed') }}</span>
                        <span class="text-gray-400">({{ val.removed.length }})</span>
                      </div>

                      <!-- Images -->
                      <div v-if="onlyImages(val.removed).length">
                        <div class="font-medium text-xs !mb-2">{{ $t('images') }}</div>
                        <div class="flex gap-2 flex-wrap">
                          <a-image v-for="(u, i) in onlyImages(val.removed)" :key="`frft-rem-img-${i}`" :src="u"
                            class="!w-[60px] aspect-[4/5] rounded-lg overflow-hidden !border !border-gray-200 !bg-white" />
                        </div>
                      </div>

                      <!-- Non-image summary -->
                      <div v-if="nonImageSummary(val.removed).total" class="!mt-2">
                        <div class="font-medium text-xs !mb-2">{{ $t('other_files') }}</div>
                        <div class="flex items-center gap-2 flex-wrap text-xs">
                          <a-tag v-if="nonImageSummary(val.removed).video" color="geekblue">
                            {{ $t('videos_n', { n: nonImageSummary(val.removed).video }) }}
                          </a-tag>
                          <a-tag v-if="nonImageSummary(val.removed).document" color="gold">
                            {{ $t('documents_n', { n: nonImageSummary(val.removed).document }) }}
                          </a-tag>
                          <a-tag v-if="nonImageSummary(val.removed).archive" color="red">
                            {{ $t('archives_n', { n: nonImageSummary(val.removed).archive }) }}
                          </a-tag>
                          <a-tag v-if="nonImageSummary(val.removed).audio" color="purple">
                            {{ $t('audios_n', { n: nonImageSummary(val.removed).audio }) }}
                          </a-tag>
                          <a-tag v-if="nonImageSummary(val.removed).other" color="default">
                            {{ $t('others_n', { n: nonImageSummary(val.removed).other }) }}
                          </a-tag>
                        </div>
                      </div>
                    </div>

                    <!-- No changes fallback -->
                    <div v-if="(!val?.added || !val.added.length) && (!val?.removed || !val.removed.length)"
                      class="text-xs text-gray-400">
                      {{ $t('no_changes') || 'No changes' }}
                    </div>
                  </template>

                  <!-- ✅ Normal array diff: { old: [], new: [] } -->
                  <template v-else-if="Array.isArray(val?.new) && Array.isArray(val?.old)">
                    <div class="space-y-3">
                      <!-- Added -->
                      <div v-if="diffArrays(val).added.length">
                        <div class="text-[11px] text-gray-500 mb-1">
                          <span class="font-semibold text-green-600">+ {{ $t('added') }}</span>
                          <span class="text-gray-400">({{ diffArrays(val).added.length }})</span>
                        </div>

                        <template v-if="looksLikeImages(field)">
                          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            <a-image v-for="(u, i) in diffArrays(val).added" :key="`add-img-${i}`" :src="u" :width="72"
                              :height="90" class="rounded-lg overflow-hidden !border !border-gray-200 !bg-white" />
                          </div>
                        </template>

                        <template v-else>
                          <div class="flex flex-wrap gap-2">
                            <a-tag v-for="(t, i) in diffArrays(val).added" :key="`add-tag-${i}`" color="green"
                              class="!m-0 max-w-full !h-auto !leading-snug !py-0.5 !whitespace-normal break-all">
                              {{ t }}
                            </a-tag>
                          </div>
                        </template>
                      </div>

                      <!-- Removed -->
                      <div v-if="diffArrays(val).removed.length">
                        <div class="text-[11px] text-gray-500 mb-1">
                          <span class="font-semibold text-red-600">- {{ $t('removed') }}</span>
                          <span class="text-gray-400">({{ diffArrays(val).removed.length }})</span>
                        </div>

                        <template v-if="looksLikeImages(field)">
                          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            <a-image v-for="(u, i) in diffArrays(val).removed" :key="`rem-img-${i}`" :src="u"
                              :width="72" :height="90"
                              class="rounded-lg overflow-hidden !border !border-gray-200 !bg-white" />
                          </div>
                        </template>

                        <template v-else>
                          <div class="flex flex-wrap gap-2">
                            <a-tag v-for="(t, i) in diffArrays(val).removed" :key="`rem-tag-${i}`" color="red"
                              class="!m-0 max-w-full !h-auto !leading-snug !py-0.5 !whitespace-normal break-all">
                              {{ t }}
                            </a-tag>
                          </div>
                        </template>
                      </div>

                      <div v-if="!diffArrays(val).added.length && !diffArrays(val).removed.length"
                        class="text-xs text-gray-400">
                        {{ $t('no_changes') || 'No changes' }}
                      </div>
                    </div>
                  </template>

                  <!-- Scalars -->
                  <template v-else>
                    <div class="space-y-2">
                      <div class="text-xs text-gray-500">
                        <div class="mb-1 opacity-70">{{ $t('old') }}</div>
                        <div class="break-words whitespace-pre-wrap leading-snug">
                          {{ stringify(val?.old) }}
                        </div>
                      </div>

                      <div class="text-xs">
                        <div class="mb-1 text-gray-500 opacity-70">{{ $t('new') }}</div>
                        <div
                          class="inline-block w-full rounded-md border border-blue-200 bg-blue-50 px-2 py-1 break-words whitespace-pre-wrap leading-snug">
                          {{ stringify(val?.new) }}
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </div>

            <!-- Raw payload (optional) -->
            <a-collapse class="!mt-3" v-if="log.changes && showRaw">
              <a-collapse-panel :header="$t('details')" :key="`raw-${log.id}`">
                <pre class="text-xs bg-gray-50 p-2 rounded overflow-auto">{{ pretty(log.changes) }}</pre>
              </a-collapse-panel>
            </a-collapse>
          </a-card>
        </template>

      </a-timeline-item>
    </a-timeline>

    <div class="!mt-4 flex justify-end" v-if="meta.total > meta.per_page">
      <a-pagination size="small" :current="meta.current_page" :total="meta.total" :pageSize="meta.per_page"
        @change="onPageChange" show-size-changer @showSizeChange="onSizeChange" />
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/lib/axios'
import { formatDateTime } from '@/utils/format'

const props = defineProps({
  visible: { type: Boolean, default: false },
  taskId: { type: [String, Number], required: true },
  showRaw: { type: Boolean, default: false }, // toggle to see raw payload
})
defineEmits(['close'])

const loading = ref(false)
const items = ref([])
// mirror your paginator shape
const meta = ref({
  current_page: 1,
  per_page: 10,
  total: 0,
})

const humanize = (key) =>
  key.replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())

const stringify = (v) => {
  if (v == null) return '—'
  if (typeof v === 'string') return v
  try { return JSON.stringify(v) } catch { return String(v) }
}

const pretty = (obj) => {
  try { return JSON.stringify(obj, null, 2) } catch { return String(obj) }
}

const looksLikeImages = (field) =>
  /image|images|sample|thumb/i.test(field)

const unique = (arr) => [...new Set(arr)]
const diffArrays = (val) => {
  const oldA = unique(val.old || [])
  const newA = unique(val.new || [])
  return {
    added: newA.filter(x => !oldA.includes(x)),
    removed: oldA.filter(x => !newA.includes(x)),
  }
}

// Categorize by file extension in the URL (no network requests needed)
const isImage = (url = '') =>
  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url.split('?')[0])

const isVideo = (url = '') =>
  /\.(mp4|mov|webm|ogg|mkv|m4v|avi)$/i.test(url.split('?')[0])

const isAudio = (url = '') =>
  /\.(mp3|wav|aac|flac|m4a|ogg)$/i.test(url.split('?')[0])

const isArchive = (url = '') =>
  /\.(zip|rar|7z|tar|gz|bz2)$/i.test(url.split('?')[0])

const isDocument = (url = '') =>
  /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/i.test(url.split('?')[0])

const onlyImages = (files) => {
  if (!Array.isArray(files)) return []
  return files.filter(isImage)
}

const nonImageSummary = (files) => {
  const res = { video: 0, document: 0, archive: 0, audio: 0, other: 0, total: 0 }
  if (!Array.isArray(files)) return res
  for (const url of files) {
    if (isImage(url)) continue
    else if (isVideo(url)) res.video++
    else if (isDocument(url)) res.document++
    else if (isArchive(url)) res.archive++
    else if (isAudio(url)) res.audio++
    else res.other++
  }
  res.total = res.video + res.document + res.archive + res.audio + res.other
  return res
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const { data } = await api.get(`/api/get-task-logs/${props.taskId}`, {
      params: { page: meta.value.current_page, per_page: meta.value.per_page }
    })
    // accept both {data:{...}} or top-level
    const payload = data?.data ? data.data : data
    items.value = payload.data || []
    meta.value.current_page = payload.current_page
    meta.value.per_page = payload.per_page
    meta.value.total = payload.total
  } catch (e) {
    console.error('Failed to load audit logs:', e)
  } finally {
    loading.value = false
  }
}

const onPageChange = (p) => {
  meta.value.current_page = p
  fetchLogs()
}
const onSizeChange = (_curr, size) => {
  meta.value.per_page = size
  meta.value.current_page = 1
  fetchLogs()
}

const reload = () => fetchLogs()

watch(() => props.visible, (v) => {
  if (v) {
    meta.value.current_page = 1
    fetchLogs()
  }
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
