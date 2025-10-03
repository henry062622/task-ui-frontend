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

        <!-- OTHER TYPES: full card with diffs -->
        <template v-else>
          <a-card :bordered="true" size="small">
            <template #title>
              <div class="flex items-center gap-2">
                <a-tag color="blue" class="uppercase !mb-0">{{ log.type }}</a-tag>
                <span class="text-gray-500">#{{ log.id }}</span>
              </div>
            </template>
            <template #extra>
              <span class="text-xs text-gray-500">{{ formatDateTime(log.created_at) }}</span>
            </template>

            <div class="text-xs text-gray-600 !mb-2">
              {{ $t('by') }}: <b>{{ log.changes?.updated_by || '-' }}</b>
            </div>

            <!-- Diff rows -->
            <a-descriptions v-if="log.changes?.diff" size="small" :column="1" :bordered="true">
              <a-descriptions-item v-for="(val, field) in log.changes.diff" :key="field" :label="humanize(field)">
                <!-- Arrays -->
                <template v-if="Array.isArray(val.new) && Array.isArray(val.old)">
                  <div class="flex flex-col gap-1">
                    <div v-if="diffArrays(val).added.length">
                      <span class="text-xs pr-2">+ {{ $t('added') }}:</span>
                      <template v-if="looksLikeImages(field)">
                        <div class="flex gap-2 flex-wrap">
                          <a-image v-for="(u, i) in diffArrays(val).added" :key="i" :src="u"
                            class="!w-[60px] aspect-[4/5] rounded-lg overflow-hidden !border !border-gray-200 !bg-white" />
                        </div>
                      </template>
                      <template v-else>
                        <a-tag v-for="(t, i) in diffArrays(val).added" :key="i" color="green">{{ t }}</a-tag>
                      </template>
                    </div>

                    <div v-if="diffArrays(val).removed.length">
                      <span class="text-xs pr-2">- {{ $t('removed') }}:</span>
                      <template v-if="looksLikeImages(field)">
                        <div class="flex gap-2 flex-wrap">
                          <a-image v-for="(u, i) in diffArrays(val).removed" :key="i" :src="u"
                            class="!w-[60px] aspect-[4/5] rounded-lg overflow-hidden !border !border-gray-200 !bg-white" />
                        </div>
                      </template>
                      <template v-else>
                        <a-tag v-for="(t, i) in diffArrays(val).removed" :key="i" color="red">{{ t }}</a-tag>
                      </template>
                    </div>
                  </div>
                </template>

                <!-- Scalars -->
                <template v-else>
                  <div class="flex flex-col gap-1">
                    <div class="text-xs text-gray-500 line-clamp-3">
                      <span class="opacity-70 pr-2">{{ $t('old') }}:</span>
                      <span>{{ stringify(val.old) }}</span>
                    </div>
                    <div class="text-xs">
                      <span class="opacity-70 pr-2">{{ $t('new') }}:</span>
                      <a-tag color="processing" class="align-middle">{{ stringify(val.new) }}</a-tag>
                    </div>
                  </div>
                </template>
              </a-descriptions-item>
            </a-descriptions>

            <!-- Raw payload (optional) -->
            <a-collapse class="!mt-2" v-if="log.changes && showRaw">
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
const emit = defineEmits(['close'])

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
