<template>
  <a-modal :open="visible" :title="$t('submit_for_review')" :footer="null" :closable="false" centered>
    <a-divider></a-divider>

    <a-form :model="formState" name="submit_task_for_review" layout="vertical" autocomplete="off" @finish="onSubmit"
      class="w-full" @finishFailed="onFinishFailed">
      <!-- upload file -->
      <a-row>
        <a-col :span="24">
          <a-form-item label="อัพโหลดไฟล์ที่เสร็จสิ้น / Upload finished file" name="file"
            :rules="[{ required: true, message: 'Please upload at least one file' }]"
            :validate-status="errors.file ? 'error' : ''" :help="errors.file">
            <FileUploader v-model="formState.file" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- text for submitted -->
      <a-row>
        <a-col :span="24">
          <a-form-item :label="$t('text_submission')" name="submitted_text">
            <a-textarea v-model:value="formState.submitted_text" :placeholder="$t('enter_submit_text')" :rows="4" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="16">
          <a-progress v-if="isUploading" :percent="overallPercent" status="active" :stroke-width="6" class="!w-[90%]" />
        </a-col>
        <a-col :span="8">
          <div class="flex items-center justify-end gap-4">
            <a-button @click="cancel">{{ $t('cancel') }}</a-button>
            <a-button html-type="submit" type="primary" :loading="isUploading" :disabled="isUploading">{{ $t('submit')
              }}</a-button>
          </div>
        </a-col>


        <!-- Footer Buttons -->

      </a-row>

    </a-form>
  </a-modal>
</template>

<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import api from '@/lib/axios'
import FileUploader from '../general/FileUploader.vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  taskId: {
    type: Number,
    required: true
  },
  task: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['close', 'submitTask'])

const formState = ref({ task_id: props.taskId, file: [], submitted_text: '' })
const errors = ref({ file: '' })
const isLoading = ref(false)
const isUploading = ref(false)
const overallPercent = ref(0)
const abortCtrl = ref(null) // for cancel()

// helper: mark new files as uploading so <a-upload> shows per-file bars
function markUploading() {
  formState.value.file.forEach(f => {
    if (f.originFileObj) {        // only freshly selected files
      f.status = 'uploading'
      f.percent = 0
    }
  })
}
function markDone() {
  formState.value.file.forEach(f => {
    if (f.originFileObj) {
      f.status = 'done'
      f.percent = 100
    }
  })
}
function markError() {
  formState.value.file.forEach(f => {
    if (f.originFileObj) {
      f.status = 'error'
    }
  })
}

// Reset modal when opened
watch(() => props.visible, (val) => {
  if (val) {
    formState.value.task_id = props.taskId
    if (props.task && props.task.task_submissions.length > 0) {
      formState.value.file = props.task.task_submissions.map(f => ({
        uid: f.id,
        name: f.file_name,
        status: 'done',
        url: f.storage_url,
        thumbUrl: f.storage_url
      }))
    } else {
      formState.value.file = []
    }
    formState.value.submitted_text = props.task?.submitted_text ?? ''

    errors.value.assignee = ''
  }
})

// Submission logic
const onSubmit = async () => {
  if (!formState.value.file.length) {
    errors.value.task_file = 'กรุณาอัพโหลดไฟล์อย่างน้อยหนึ่งไฟล์ (ภาพ, วิดีโอ, ZIP, RAR) / Please upload at least one file (image, video, ZIP, RAR)';
    return;
  }

  isUploading.value = true
  overallPercent.value = 0
  abortCtrl.value = new AbortController()
  errors.value.file = ''

  // per-file sizes for a nicer approximation
  const newFiles = formState.value.file.filter(f => !!f.originFileObj)
  const sizes = newFiles.map(f => f.originFileObj.size || 0)
  const totalSize = sizes.reduce((a, b) => a + b, 0)

  // reflect progress bars in the Upload list
  markUploading()

  const formData = new FormData();
  formData.append('task_id', formState.value.task_id);
  formState.value.file.forEach((fileObj) => {
    const actualFile = fileObj.originFileObj;
    if (actualFile) {
      formData.append('files[]', actualFile);
    } else {
      formData.append('files[]', fileObj.uid);
    }
  });
  formData.append('submitted_text', formState.value.submitted_text);

  // Update per-file percents by distributing loaded bytes across file sizes
  const updatePerFilePercents = (loadedBytesFromFiles) => {
    let remaining = loadedBytesFromFiles
    newFiles.forEach((f, i) => {
      const s = sizes[i] || 1
      const doneForFile = Math.max(0, Math.min(s, remaining))
      const pct = Math.round((doneForFile / s) * 100)
      f.percent = pct
      remaining -= doneForFile
    })
  }

  try {
    const res = await api.post('/api/task/submit-for-review', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal: abortCtrl.value.signal,
      onUploadProgress: (e) => {
        if (!e.total) return
        // Overall progress straight from Axios
        overallPercent.value = Math.round((e.loaded / e.total) * 100)
        // e.total includes multipart overhead; approximate bytes applied to files only
        if (totalSize > 0) {
          const ratio = e.loaded / e.total
          updatePerFilePercents(totalSize * ratio)
        }
      }
    })
    markDone()
    // robustly extract the Task (works with both ApiResponse wrapper and raw Task)
    const task = res.data.data || null
    // If you already have the task from the first call, remove this second call.
    emit('submitTask', task)
    emit('close')
    message.success('Uploaded and submitted')
  } catch (err) {
    markError()
    message.error(err?.response?.data?.message || 'Upload failed')
  } finally {
    isUploading.value = false
    abortCtrl.value = null
  }

  // await api.post('/api/task/submit-for-review', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // }).then(res => {
  //   const task = res.data.data;
  //   emit('submitTask', task);
  //   emit('close')
  // })

  // isLoading.value = false

}

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo)
}

const cancel = () => {
  emit('close')
}

// Handle paste from clipboard (for image)
function onPaste(e) {
  const files = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'))
  if (files.length) {
    const file = files[0]
    formState.value.file = [
      ...formState.value.file,
      {
        uid: Date.now().toString(),
        name: file.name,
        status: 'done',
        originFileObj: file,
      }
    ]
  }
}

onMounted(() => {
  window.addEventListener('paste', onPaste)
})

onBeforeMount(() => {
  window.removeEventListener('paste', onPaste)
})
</script>
