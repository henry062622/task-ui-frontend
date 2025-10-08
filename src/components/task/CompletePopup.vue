<template>
  <a-modal :open="visible" :title="$t('update_task_status')" :footer="null" :closable="false" centered>
    <a-divider></a-divider>

    <a-form :model="formState" name="update_task_status" layout="vertical" autocomplete="off" @finish="onSubmit"
      @finishFailed="onFinishFailed" class="w-full">
      <!-- Status selection -->
      <a-form-item v-if="!onlyNeedRevision" :label="$t('status')" name="status"
        :rules="[{ required: true, message: 'Please select a status' }]">
        <a-radio-group v-model:value="formState.status">
          <a-radio value="complete">Complete</a-radio>
          <a-radio value="needs-revision">Need Revision</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item v-if="formState.status === 'needs-revision'" :label="$t('upload_image')" name="fileList">
        <a-upload list-type="picture-card" :file-list="formState.fileList" :before-upload="beforeUpload" :max-count="5"
          :multiple="true" accept="image/*,video/*,.zip,.rar" @remove="onRemove">
          <div>
            <upload-outlined />
            <div style="margin-top: 8px">Upload Files</div>
          </div>
        </a-upload>
      </a-form-item>

      <!-- Revision reason (only if Need Revision) -->
      <a-form-item v-if="formState.status === 'needs-revision'" :label="$t('revision_reason')" name="revision_reason"
        :rules="[{ required: true, message: 'Please enter revision reason' }]">
        <a-textarea v-model:value="formState.revision_reason" :rows="4"
          placeholder="Please provide the reason for revision" />
      </a-form-item>

      <!-- Footer Buttons -->
      <a-row :gutter="16">
        <a-col :span="16">
          <a-progress v-if="isUploading" :percent="overallPercent" status="active" :stroke-width="6" class="!w-[90%]" />
        </a-col>
        <a-col :span="8">
          <div class="flex items-center justify-end gap-4">
            <a-button @click="cancel">{{ $t('cancel') }}</a-button>
            <a-button html-type="submit" type="primary" :loading="isUploading" :disabled="isUploading">
              {{ $t('submit') }}
            </a-button>
          </div>
        </a-col>

      </a-row>

    </a-form>
  </a-modal>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import api from '@/lib/axios'
import { UploadOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
  taskId: { type: Number, required: true },
  onlyNeedRevision: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'completed'])

const formState = ref({
  task_id: props.taskId,
  status: '',
  revision_reason: '',
  fileList: [],
})
const isLoading = ref(false)
const isUploading = ref(false)
const overallPercent = ref(0)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      formState.value.task_id = props.taskId
      formState.value.status = props.onlyNeedRevision ? 'needs-revision' : ''
      formState.value.revision_reason = ''
      formState.value.fileList = []
    }
  },
)

const beforeUpload = (file) => {
  // formState.value.fileList = [
  //   {
  //     uid: Date.now().toString(),
  //     name: file.name,
  //     status: 'done',
  //     originFileObj: file,
  //   },
  // ]

  const item = {
    uid: `${Date.now()}-${Math.random()}`,
    name: file.name,
    status: 'done',
    originFileObj: file,
  }
  formState.value.fileList = [...formState.value.fileList, item]
  return false
}

function markUploading() {
  formState.value.fileList.forEach(f => {
    if (f.originFileObj) {
      f.status = 'uploading'
      f.percent = 0
    }
  })
}
function markDone() {
  formState.value.fileList.forEach(f => {
    if (f.originFileObj) {
      f.status = 'done'
      f.percent = 100
    }
  })
}
function markError() {
  formState.value.fileList.forEach(f => {
    if (f.originFileObj) f.status = 'error'
  })
}

const onRemove = (file) => {
  // formState.value.fileList = []
  formState.value.fileList = formState.value.fileList.filter(f => f.uid !== file.uid)
}

// const onSubmit = async () => {
//   if (!formState.value.status) return
//   console.log(formState.value)

//   isUploading.value = true;
//   overallPercent.value = 0;

//   const formData = new FormData()
//   formData.append('task_id', formState.value.task_id)
//   formData.append('status', formState.value.status)
//   if (formState.value.status == 'needs-revision') {
//     formData.append('revision_reason', formState.value.revision_reason)
//     if (formState.value.fileList.length > 0) {
//       // formData.append('file', formState.value.fileList[0].originFileObj)
//       for (const f of formState.value.fileList) {
//         formData.append('files[]', f.originFileObj)
//       }
//     }

//   }

//   const apiUrl =
//     formState.value.status == 'needs-revision'
//       ? '/api/task/needs-revision'
//       : '/api/task/change-status'

//   await api
//     .post(apiUrl, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     })
//     .then((res) => {
//       emit('completed', res.data.data)
//       emit('close')
//     })
//     .finally(() => {
//       isLoading.value = false
//     })
// }

const onSubmit = async () => {
  if (!formState.value.status) return

  isUploading.value = true
  overallPercent.value = 0

  const formData = new FormData()
  formData.append('task_id', formState.value.task_id)
  formData.append('status', formState.value.status)

  if (formState.value.status === 'needs-revision') {
    formData.append('revision_reason', formState.value.revision_reason)

    // append files (images/videos/zip/rar)
    const newFiles = formState.value.fileList.filter(f => !!f.originFileObj)
    newFiles.forEach(f => formData.append('files[]', f.originFileObj))

    // per-file progress approximation
    const sizes = newFiles.map(f => f.originFileObj.size || 0)
    const totalSize = sizes.reduce((a, b) => a + b, 0)

    // show bars in list
    markUploading()

    const updatePerFilePercents = (loadedBytesFromFiles) => {
      let remaining = loadedBytesFromFiles
      newFiles.forEach((f, i) => {
        const s = sizes[i] || 1
        const doneForFile = Math.max(0, Math.min(s, remaining))
        f.percent = Math.round((doneForFile / s) * 100)
        remaining -= doneForFile
      })
    }

    try {
      const apiUrl = '/api/task/needs-revision'
      const res = await api.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (!e.total) return
          overallPercent.value = Math.round((e.loaded / e.total) * 100)
          if (totalSize > 0) {
            const ratio = e.loaded / e.total
            updatePerFilePercents(totalSize * ratio)
          }
        }
      })
      markDone()
      emit('completed', res.data.data)
      emit('close')
    } catch (err) {
      markError()
    } finally {
      isUploading.value = false
    }
    return
  }

  // non-revision branch (unchanged)
  try {
    const res = await api.post('/api/task/change-status', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    emit('completed', res.data.data)
    emit('close')
  } finally {
    isUploading.value = false
  }
}

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo)
}

const cancel = () => {
  emit('close')
}

// Handle paste from clipboard (for image)
function onPaste(e) {
  if (formState.value.status !== 'needs-revision') return
  const files = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'))
  if (files.length) {
    // const file = files[0]
    // formState.value.fileList = [
    //   {
    //     uid: Date.now().toString(),
    //     name: file.name,
    //     status: 'done',
    //     originFileObj: file,
    //   },
    // ]
    const items = files.map(file => ({
      uid: `${Date.now()}-${Math.random()}`,
      name: file.name || 'pasted-image',
      status: 'done',
      originFileObj: file,
    }))
    formState.value.fileList = [...formState.value.fileList, ...items]
  }
}

onMounted(() => {
  window.addEventListener('paste', onPaste)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
})
</script>
