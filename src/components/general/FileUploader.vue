<template>
  <a-upload :list-type="listType" :multiple="multiple" :file-list="fileList" :before-upload="beforeUpload"
    @change="handleChange" @preview="handlePreview" :accept="accept">
    <slot>
      <div>
        <plus-outlined />
        <div style="margin-top: 8px">{{ $t('upload') }}</div>
      </div>
    </slot>
  </a-upload>

  <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 8px" />

  <!-- Preview Modal -->
  <a-modal v-model:open="previewVisible" :title="previewTitle" :footer="null" destroy-on-close
    @afterClose="cleanupPreviewUrl">
    <div v-if="previewType === 'image'">
      <img :src="previewSrc" alt="preview" style="max-width:100%; display:block; margin:0 auto; height: auto;" />
    </div>

    <div v-else-if="previewType === 'pdf'">
      <iframe :src="previewSrc" style="width:100%; height:70vh;" />
    </div>

    <div v-else-if="previewType === 'video'">
      <video :src="previewSrc" style="width:100%;" controls />
    </div>

    <div v-else class="text-center">
      <p style="margin-bottom: 12px;">
        {{ t('preview_not_supported') }}
      </p>
      <a :href="previewSrc" :download="previewTitle">
        {{ t('download') }}
      </a>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  listType: {
    type: String,
    default: 'picture-card'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  allowedMimeTypes: {
    type: Array,
    default: () => [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/pdf', // pdf
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'application/zip',
      'application/x-rar-compressed',
      // WPS MIME types (approximate)
      'application/vnd.ms-works',
      'application/wps-office',
      'application/vnd.ms-excel.sheet.macroenabled.12',
      'application/vnd.ms-powerpoint.presentation.macroenabled.12',
    ]
  },
  allowedExts: {
    type: Array,
    default: () => [
      'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'zip', 'rar',
      'wps', 'wpt', 'et', 'ett', 'dps', 'dpt'
    ]
  },
  accept: {
    type: String,
    default: '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.zip,.rar,.wps,.wpt,.et,.ett,.dps,.dpt'
  }
})

const emit = defineEmits(['update:modelValue'])

const fileList = ref([...props.modelValue])
const errorMsg = ref('')

// --- Preview state ---
const previewVisible = ref(false)
const previewTitle = ref('')
const previewSrc = ref('')
const previewType = ref('') // 'image' | 'pdf' | 'video' | 'other'
let objectUrlToRevoke = null

// Always return false to prevent auto upload
const beforeUpload = (file) => {
  const isAllowedType = props.allowedMimeTypes.includes(file.type)
  const extension = file.name.split('.').pop().toLowerCase()
  const isAllowedExt = props.allowedExts.includes(extension)

  if (!isAllowedType && !isAllowedExt) {
    errorMsg.value = t('validation.fileTypeNotSupported', {
      types: props.allowedExts.join(', ')
    })
    return false
  }
  errorMsg.value = ''
  return false
}

const handleChange = (info) => {
  // Manually update fileList, only keep files which passed beforeUpload
  const filteredList = info.fileList.filter(file => {
    const ext = file.name.split('.').pop().toLowerCase()
    return props.allowedExts.includes(ext)
  })
  fileList.value = filteredList
  emit('update:modelValue', fileList.value)
}

const handlePreview = async (file) => {
  cleanupPreviewUrl()

  const name = file.name || ''
  const ext = (name.split('.').pop() || '').toLowerCase()
  const type = file.type || guessMimeFromExt(ext)
  previewTitle.value = name

  if (isImage({ type, name: file.name })) {
    previewType.value = 'image'
    previewSrc.value = file.url || file.thumbUrl || await readFileAsDataURL(file.originFileObj || file)
  } else if (type === 'application/pdf' || ext === 'pdf') {
    previewType.value = 'pdf'
    previewSrc.value = file.url || makeObjectURL(file.originFileObj || file)
  } else if (type === 'video/mp4' || ext === 'mp4') {
    previewType.value = 'video'
    previewSrc.value = file.url || makeObjectURL(file.originFileObj || file)
  } else {
    previewType.value = 'other'
    previewSrc.value = file.url || makeObjectURL(file.originFileObj || file)
  }

  previewVisible.value = true
}

function isImage(file) {
  const t = (file.type || '').toLowerCase()
  const n = (file.name || '').toLowerCase()
  return t.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(n)
}

function guessMimeFromExt(ext) {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image/*'
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'mp4') return 'video/mp4'
  return ''
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function makeObjectURL(file) {
  const url = URL.createObjectURL(file)
  objectUrlToRevoke = url
  return url
}

function cleanupPreviewUrl() {
  if (objectUrlToRevoke) {
    URL.revokeObjectURL(objectUrlToRevoke)
    objectUrlToRevoke = null
  }
}

watch(() => props.modelValue, (newVal) => {
  fileList.value = [...newVal]
})
</script>
