<template>
  <div v-if="(files?.length || 0) > 0">
    <!-- Actions (same as submissions) -->
    <div class="flex items-center gap-2 mb-2">
      <a-button type="primary" :disabled="selectedCount === 0" @click="downloadSelectedZip"
        class="!flex items-center gap-1">
        <DownloadOutlined /> {{ t('download_selected') }} ({{ selectedCount }})
      </a-button>
      <a-button @click="selectAllVisible" :disabled="!files?.length">
        {{ t('select_all') }}
      </a-button>
      <a-button @click="clearSelection" :disabled="selectedCount === 0">
        {{ t('clear') }}
      </a-button>

      <!-- inline progress (right side of buttons) -->
      <div class="ml-4 flex items-center gap-2" v-show="progressVisible">
        <a-progress :percent="Math.round(progressPercent)" status="active" :show-info="false" style="width:260px" />
        <span class="text-xs text-gray-500 whitespace-nowrap">{{ progressText }}</span>
      </div>
    </div>

    <a-row :gutter="16">
      <a-col :span="24">
        <a-row>
          <a-col :span="24" class="!font-semibold !text-base">
            {{ t('files_required_for_task') }} :
          </a-col>

          <!-- same hint as submissions -->
          <a-col :span="24">
            <a-alert type="warning" :message="t('submission_hint')" show-icon banner class="!my-2" />
          </a-col>

          <a-col :span="24">
            <div class="flex h-auto gap-4 !mt-2 flex-wrap w-full">
              <div class="flex h-auto gap-4 !mt-2 flex-wrap w-full">
                <div v-for="file in files" :key="keyOf(file)" class="relative">
                  <!-- IMAGES -->
                  <div class="w-full">
                    <template v-if="isImage(file.storage_url)">
                      <div
                        class="relative w-[120px] aspect-[4/5] rounded-lg overflow-hidden border border-gray-200 bg-white"
                        :class="isSelected(file) ? 'ring-2 ring-blue-500' : ''">
                        <SelectableImage :image="file" :selected="isSelected(file)" :borderless="true" :width="120"
                          @toggle="toggleSelected" />
                        <div v-if="isSelected(file)"
                          class="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          Selected
                        </div>
                      </div>
                      <a-button class="!flex w-[120px] items-center justify-center gap-1 !mt-1.5"
                        @click.stop="downloadSingle(file)">
                        <DownloadOutlined /> {{ t('download') }}
                      </a-button>
                    </template>

                    <!-- VIDEOS -->
                    <template v-else-if="isVideo(file.storage_url)">
                      <div
                        class="relative w-[250px] aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 bg-white"
                        :class="isSelected(file) ? 'ring-2 ring-blue-500' : ''" @click="onAssetClick($event, file)">
                        <video class="w-full h-full object-cover" controls preload="metadata">
                          <source :src="file.storage_url" type="video/mp4" />
                        </video>
                        <div v-if="isSelected(file)"
                          class="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          Selected
                        </div>
                      </div>
                    </template>

                    <!-- ARCHIVES -->
                    <template v-else-if="isArchive(file.storage_url)">
                      <div
                        class="relative w-[120px] aspect-[4/5] rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                        :class="isSelected(file) ? 'ring-2 ring-blue-500' : ''" @click="onAssetClick($event, file)">
                        <div class="w-full h-full flex flex-col items-center justify-center">
                          <FileZipOutlined class="text-4xl mb-2" />
                          <div class="text-xs text-gray-700 text-center px-2 truncate w-[100px]">
                            {{ file.file_name || 'Archive' }}
                          </div>
                        </div>
                        <div v-if="isSelected(file)"
                          class="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          Selected
                        </div>
                      </div>
                      <a-button class="!flex w-[120px] items-center justify-center gap-1 !mt-1.5"
                        @click.stop="downloadSingle(file)">
                        <DownloadOutlined /> {{ t('download') }}
                      </a-button>
                    </template>

                    <!-- OTHER DOCS -->
                    <template v-else>
                      <div
                        class="relative w-[120px] aspect-[4/5] rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                        :class="isSelected(file) ? 'ring-2 ring-blue-500' : ''" @click="onAssetClick($event, file)">
                        <div class="w-full h-full flex flex-col items-center justify-center">
                          <component :is="getIconComponent(file.file_name)" class="text-4xl mb-2" />
                          <div class="text-xs text-gray-700 text-center px-2 truncate w-[100px]"
                            :title="file.file_name">
                            {{ file.file_name || 'Document' }}
                          </div>
                        </div>
                        <div v-if="isSelected(file)"
                          class="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          Selected
                        </div>
                      </div>
                      <a-button class="!flex w-[120px] items-center justify-center gap-1 !mt-1.5"
                        @click.stop="downloadSingle(file)">
                        <DownloadOutlined /> {{ t('download') }}
                      </a-button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import SelectableImage from '@/components/media/SelectableImage.vue'
import {
  DownloadOutlined,
  FileZipOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'

const { t } = useI18n()

// props
const props = defineProps({
  files: { type: Array, default: () => [] }   // mirrors task.files
})

/* ---------- file type helpers ---------- */
const IMG_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']
const VID_EXT = ['mp4', 'webm', 'ogg', 'mov']
const ARC_EXT = ['zip', 'rar', '7z']

const extOf = (s = '') => {
  const base = String(s).split('?')[0]
  const last = base.split('.').pop()
  return last ? last.toLowerCase() : ''
}
const isImage = (u) => IMG_EXT.includes(extOf(u))
const isVideo = (u) => VID_EXT.includes(extOf(u))
const isArchive = (u) => ARC_EXT.includes(extOf(u))

const getIconComponent = (name = '') => {
  const e = extOf(name)
  if (e === 'pdf') return FilePdfOutlined
  if (['doc', 'docx'].includes(e)) return FileWordOutlined
  if (['xls', 'xlsx', 'csv'].includes(e)) return FileExcelOutlined
  return FileTextOutlined
}

/* ---------- key + selection ---------- */
const keyOf = (f) => f?.storage_url || f?.id || JSON.stringify(f)

const selectedKeys = ref(new Set())
const isSelected = (f) => selectedKeys.value.has(keyOf(f))
const toggleSelected = (f) => {
  const k = keyOf(f)
  if (selectedKeys.value.has(k)) selectedKeys.value.delete(k)
  else selectedKeys.value.add(k)
  selectedKeys.value = new Set(selectedKeys.value) // trigger reactivity
}
const onAssetClick = (e, f) => {
  if (e.ctrlKey || e.metaKey) {
    toggleSelected(f)
    e.preventDefault()
    e.stopPropagation()
  }
}
const selectedCount = computed(() => selectedKeys.value.size)
const selectAllVisible = () => {
  (props.files || []).forEach((f) => selectedKeys.value.add(keyOf(f)))
  selectedKeys.value = new Set(selectedKeys.value)
}
const clearSelection = () => { selectedKeys.value = new Set() }

/* ---------- progress ---------- */
const progressVisible = ref(false)
const progressPercent = ref(0)
const progressText = ref('')

/* ---------- download helpers ---------- */
async function downloadSingle(file) {
  try {
    const res = await fetch(file.storage_url, { mode: 'cors' })
    const blob = await res.blob()
    const a = document.createElement('a')
    const name = inferFilename(file)
    const href = URL.createObjectURL(blob)
    a.href = href
    a.setAttribute('download', name)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(href)
  } catch (e) {
    console.error('download failed:', e)
  }
}
const sanitizeName = (n = 'file') => n.replace(/[\/\\?%*:|"<>]/g, '_')
const inferFilename = (f) => {
  if (f?.file_name) return sanitizeName(f.file_name)
  const parts = String(f?.storage_url || '').split('?')[0].split('/')
  return sanitizeName(parts[parts.length - 1] || 'download')
}
const uniqueName = (name, used) => {
  if (!used.has(name)) { used.add(name); return name }
  const dot = name.lastIndexOf('.')
  const base = dot >= 0 ? name.slice(0, dot) : name
  const ext = dot >= 0 ? name.slice(dot) : ''
  let i = 1, cand = `${base} (${i})${ext}`
  while (used.has(cand)) { i++; cand = `${base} (${i})${ext}` }
  used.add(cand)
  return cand
}
const stamp = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}

/* ---------- multi-zip with inline progress ---------- */
async function downloadSelectedZip() {
  const all = props.files || []
  const byKey = new Map(all.map(f => [keyOf(f), f]))
  const selected = Array.from(selectedKeys.value)
  const total = selected.length
  if (!total) return

  progressVisible.value = true
  progressPercent.value = 0
  progressText.value = `Fetching files (0/${total})`

  const zip = new JSZip()
  const folder = zip.folder('task_files')
  const used = new Set()

  // Phase 1: fetch (0..80%)
  let fetched = 0
  for (const k of selected) {
    const f = byKey.get(k)
    if (!f) continue
    try {
      const res = await fetch(f.storage_url, { mode: 'cors' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      folder.file(uniqueName(inferFilename(f), used), blob)
    } catch (e) {
      console.error('zip fetch failed:', f?.storage_url, e)
    } finally {
      fetched++
      progressPercent.value = (fetched / total) * 80
      progressText.value = `Fetching files (${fetched}/${total})`

      await new Promise(r => setTimeout(r, 20))
    }
  }

  // Phase 2: zipping (80..100%)
  progressText.value = 'Zipping files...'
  const zipBlob = await zip.generateAsync(
    { type: 'blob' },
    (meta) => { progressPercent.value = 80 + (meta.percent * 0.20) }
  )

  saveAs(zipBlob, `task-files-${stamp()}.zip`)

  progressPercent.value = 100
  progressText.value = 'Completed'
  setTimeout(() => {
    progressVisible.value = false
    clearSelection()
  }, 600)
}
</script>
