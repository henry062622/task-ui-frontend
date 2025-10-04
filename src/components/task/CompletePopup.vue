<template>
  <a-modal :open="visible" :title="$t('update_task_status')" :footer="null" :closable="false" centered>
    <a-divider></a-divider>

    <a-form :model="formState" name="update_task_status" layout="vertical" autocomplete="off" @finish="onSubmit"
      @finishFailed="onFinishFailed" class="w-full">
      <!-- Status selection -->
      <a-form-item :label="$t('status')" name="status" :rules="[{ required: true, message: 'Please select a status' }]">
        <a-radio-group v-model:value="formState.status">
          <a-radio value="complete">Complete</a-radio>
          <a-radio value="needs-revision">Need Revision</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item v-if="formState.status === 'needs-revision'" :label="$t('upload_image')" name="fileList">
        <a-upload list-type="picture-card" :file-list="formState.fileList" :before-upload="beforeUpload" :max-count="1"
          accept="image/*" @remove="onRemove">
          <div>
            <upload-outlined />
            <div style="margin-top: 8px">Upload Image</div>
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
      <div class="flex items-center justify-end gap-4">
        <a-button @click="cancel">{{ $t('cancel') }}</a-button>
        <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">
          {{ $t('submit') }}
        </a-button>
      </div>
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
})
const emit = defineEmits(['close', 'completed'])

const formState = ref({
  task_id: props.taskId,
  status: '',
  revision_reason: '',
  fileList: [],
})
const isLoading = ref(false)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      formState.value.task_id = props.taskId
      formState.value.status = ''
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

const onRemove = (file) => {
  // formState.value.fileList = []
  formState.value.fileList = formState.value.fileList.filter(f => f.uid !== file.uid)
}

const onSubmit = async () => {
  if (!formState.value.status) return
  console.log(formState.value)

  isLoading.value = true
  const formData = new FormData()
  formData.append('task_id', formState.value.task_id)
  formData.append('status', formState.value.status)
  if (formState.value.status == 'needs-revision') {
    formData.append('revision_reason', formState.value.revision_reason)
    if (formState.value.fileList.length > 0) {
      // formData.append('file', formState.value.fileList[0].originFileObj)
      for (const f of formState.value.fileList) {
        formData.append('files[]', f.originFileObj)
      }
    }

  }

  const apiUrl =
    formState.value.status == 'needs-revision'
      ? '/api/task/needs-revision'
      : '/api/task/change-status'

  await api
    .post(apiUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => {
      emit('completed', res.data.data)
      emit('close')
    })
    .finally(() => {
      isLoading.value = false
    })
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
