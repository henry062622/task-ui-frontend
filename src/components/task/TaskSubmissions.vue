<template>
  <div v-if="(submissions?.length || 0) > 0 || submittedText">
    <!-- Actions -->
    <div class="flex items-center gap-2 mb-2" v-if="(submissions?.length || 0) > 0">
      <a-button type="primary" :disabled="selectedCount === 0" @click="downloadSelectedZip"
        class="!flex items-center gap-1">
        <DownloadOutlined /> {{ t('download_selected') }} ({{ selectedCount }})
      </a-button>
      <a-button @click="selectAllVisible" :disabled="!submissions?.length">
        {{ t('select_all') }}
      </a-button>
      <a-button @click="clearSelection" :disabled="selectedCount === 0">
        {{ t('clear') }}
      </a-button>

      <div class="ml-4 flex items-center gap-2" v-show="progressVisible">
        <a-progress :percent="Math.round(progressPercent)" status="active" :show-info="false" style="width:260px" />
        <span class="text-xs text-gray-500 whitespace-nowrap">{{ progressText }}</span>
      </div>
    </div>

    <a-row :gutter="16" v-if="(submissions?.length || 0) > 0">
      <a-col :span="12">
        <a-row>
          <a-col :span="24" class="!font-semibold !text-base">{{ t('task_submission') }} :</a-col>
          <a-col :span="24">
            <a-alert type="warning" :message="t('submission_hint')" show-icon banner class="!my-2" />
          </a-col>
          <a-col :span="24">
            <div class="flex h-auto gap-4 !mt-2 flex-wrap w-full">
              <div class="flex h-auto gap-4 !mt-2 flex-wrap w-full">
                <div v-for="file in submissions" :key="keyOf(file)" class="relative">
                  <!-- IMAGES -->
                  <div class="w-full">
                    <template v-if="isImage(file.storage_url)">
                      <!-- Use image component in 'borderless' mode *inside* a uniform card -->
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

                    <!-- ARCHIVES (zip/rar/7z) -->
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

      <!-- Optional text submission -->
      <a-col :span="12" v-if="submittedText">
        <a-row>
          <a-col :span="24" class="!font-semibold !text-base !mb-2">
            {{ t('text_submission') }} :
          </a-col>
          <a-col :span="24">
            <div class="rounded-xl shadow-sm p-4" v-html="linkifiedText(submittedText)"></div>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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
import axios from 'axios'
import api from '@/lib/axios'

const { t } = useI18n()

const props = defineProps({
  submissions: { type: Array, default: () => [] },
  submittedText: { type: String, default: '' },
})

/** ---------- helpers: file type ---------- */
const IMG_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']
const VID_EXT = ['mp4', 'webm', 'ogg', 'mov']
const ARC_EXT = ['zip', 'rar', '7z']

const extOf = (urlOrName = '') => {
  const s = String(urlOrName).split('?')[0]
  const last = s.split('.').pop()
  return last ? last.toLowerCase() : ''
}

const isImage = (u) => IMG_EXT.includes(extOf(u))
const isVideo = (u) => VID_EXT.includes(extOf(u))
const isArchive = (u) => ARC_EXT.includes(extOf(u))

const getIconComponent = (name = '') => {
  const ext = extOf(name)
  if (['pdf'].includes(ext)) return FilePdfOutlined
  if (['doc', 'docx'].includes(ext)) return FileWordOutlined
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileExcelOutlined
  return FileTextOutlined
}

const progressVisible = ref(false)
const progressPercent = ref(0)
const progressText = ref('')

/** ---------- helpers: key + linkify ---------- */
const keyOf = (f) => f?.storage_url || f?.id || JSON.stringify(f)

const urlRegex = /(https?:\/\/[^\s<]+)/g
function linkifiedText(text = '') {
  return String(text).replace(urlRegex, (m) => `<a href="${m}" target="_blank" rel="noopener noreferrer">${m}</a>`)
}

/** ---------- selection state ---------- */
const selectedKeys = ref(new Set())

const isSelected = (file) => selectedKeys.value.has(keyOf(file))

function toggleSelected(file) {
  const k = keyOf(file)
  if (selectedKeys.value.has(k)) selectedKeys.value.delete(k)
  else selectedKeys.value.add(k)
  // reactivity for Set
  selectedKeys.value = new Set(selectedKeys.value)
}

function onAssetClick(e, file) {
  if (e.ctrlKey || e.metaKey) {
    toggleSelected(file)
    e.preventDefault()
    e.stopPropagation()
  }
}

const selectedCount = computed(() => selectedKeys.value.size)

function selectAllVisible() {
  (props.submissions || []).forEach((f) => selectedKeys.value.add(keyOf(f)))
  selectedKeys.value = new Set(selectedKeys.value)
}

function clearSelection() {
  selectedKeys.value = new Set()
}

/** ---------- downloads ---------- */
async function downloadSingle(file) {
  try {
    // const response = await fetch(file.storage_url, { mode: 'cors' })
    // const blob = await response.blob()

    // const a = document.createElement('a')
    // let filename = file.file_name
    // if (!filename) {
    //   const parts = (file.storage_url || '').split('/')
    //   filename = parts[parts.length - 1] || 'download'
    // }
    // const href = URL.createObjectURL(blob)
    // a.href = href
    // a.setAttribute('download', filename)
    // document.body.appendChild(a)
    // a.click()
    // document.body.removeChild(a)
    // URL.revokeObjectURL(href)
    const url =
      `/api/download?url=${encodeURIComponent(file.storage_url)}&filename=${encodeURIComponent(file.file_name || '')}`;

    api.get(url, { responseType: 'arraybuffer' }).then((res) => {
      console.log(res);

      // filename (prefer header)
      let filename = file.file_name || 'download';
      const cd = res.headers['content-disposition'];
      const m = cd && cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
      if (m && m[1]) filename = decodeURIComponent(m[1]);

      // Build a Blob directly from the ArrayBuffer
      const type = res.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([res.data], { type });

      // Download
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObj);
    });
  } catch (err) {
    console.error('Failed to download:', err)
  }
}

async function downloadSelected() {
  const map = new Map((props.submissions || []).map((f) => [keyOf(f), f]))
  for (const k of selectedKeys.value) {
    const f = map.get(k)
    if (!f) continue

    await downloadSingle(f)

    await new Promise((r) => setTimeout(r, 120))
  }
}

function sanitizeName(name = 'file') {
  // remove characters illegal on some OSes
  return name.replace(/[\/\\?%*:|"<>]/g, '_')
}
function inferFilename(file) {
  if (file?.file_name) return sanitizeName(file.file_name)
  const parts = String(file?.storage_url || '').split('?')[0].split('/')
  return sanitizeName(parts[parts.length - 1] || 'download')
}

// ensure unique names inside the zip
function uniqueName(name, used) {
  if (!used.has(name)) { used.add(name); return name }
  const dot = name.lastIndexOf('.')
  const base = dot >= 0 ? name.slice(0, dot) : name
  const ext = dot >= 0 ? name.slice(dot) : ''
  let i = 1, candidate = `${base} (${i})${ext}`
  while (used.has(candidate)) { i++; candidate = `${base} (${i})${ext}` }
  used.add(candidate)
  return candidate
}

function stamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}


// --- main zip downloader ---
async function downloadSelectedZip() {
  const all = props.submissions || []
  const byKey = new Map(all.map(f => [keyOf(f), f]))
  const selected = Array.from(selectedKeys.value)
  const total = selected.length
  if (!total) return

  // show inline progress
  progressVisible.value = true
  progressPercent.value = 0
  progressText.value = `Fetching files (0/${total})`

  const zip = new JSZip()
  const folder = zip.folder('task_submissions')
  const usedNames = new Set()

  // ---- Phase 1: fetch (0..80%)
  let fetched = 0
  for (const k of selected) {
    const f = byKey.get(k)
    if (!f) continue
    try {
      const url =
        `/api/download?url=${encodeURIComponent(f.storage_url)}&filename=${encodeURIComponent(f.file_name || '')}`;

      const res = await api.get(url, { responseType: 'arraybuffer' })
      console.log(res);

      // Build a Blob directly from the ArrayBuffer
      const type = res.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([res.data], { type });

      // const res = await fetch(f.storage_url, { mode: 'cors' })
      // if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // const blob = await res.blob()
      const name = uniqueName(inferFilename(f), usedNames)
      folder.file(name, blob)
    } catch (e) {
      console.error('Failed to fetch for ZIP:', f?.storage_url, e)
    } finally {
      fetched += 1
      progressPercent.value = (fetched / total) * 80
      progressText.value = `Fetching files (${fetched}/${total})`
      // keep UI responsive

      await new Promise(r => setTimeout(r, 20))
    }
  }

  // ---- Phase 2: zipping (80..100%)
  progressText.value = 'Zipping files...'
  const zipBlob = await zip.generateAsync(
    { type: 'blob' },
    (meta) => { progressPercent.value = 80 + (meta.percent * 0.20) }
  )

  saveAs(zipBlob, `task-submissions-${stamp()}.zip`)

  // show 100% briefly, then hide + clear selection
  progressPercent.value = 100
  progressText.value = 'Completed'
  setTimeout(() => {
    progressVisible.value = false
    clearSelection()
  }, 600)
}

</script>
