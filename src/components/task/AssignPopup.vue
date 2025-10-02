<template>
  <a-modal :open="visible" :title="isReassign ? $t('reassign_the_task') : $t('assign_the_task')" :footer="null"
    :closable="false" centered>
    <a-divider></a-divider>

    <a-form :model="formState" name="assign_task" layout="vertical" autocomplete="off" @finish="onSubmit" class="w-full"
      @finishFailed="onFinishFailed">
      <!-- assignee -->
      <a-row>
        <a-col :span="24">
          <a-form-item :label="$t('assignee')" name="assignee" :rules="[{ required: true, message: 'please select !' }]"
            :validate-status="errors.assignee ? 'error' : ''" :help="errors.assignee">
            <a-select v-model:value="formState.assignee" :placeholder="$t('assignee')" allow-clear style="width: 100%">
              <a-select-option v-for="user in userList" :key="user.id" :value="user.id"> {{ user.name
                }} </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-4">
        <a-button @click="cancel">{{ $t('cancel') }}</a-button>
        <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">{{ isReassign ?
          $t('reassign') : $t('assign') }}</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/lib/axios'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  userList: {
    type: Array,
    required: true
  },
  taskId: {
    type: Number,
    required: true
  },
  currentAssigneeId: { type: Number, default: null },
  isReassign: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'assigned'])

const formState = ref({ task_id: props.taskId, assignee: null })
const errors = ref({ assignee: null })
const isLoading = ref(false)

// Reset modal when opened
watch(() => props.visible, (val) => {
  if (val) {
    formState.value.task_id = props.taskId
    formState.value.assignee = props.currentAssigneeId || null
    errors.value.assignee = null
  }
})

// Submission logic
const onSubmit = async () => {
  if (!formState.value.assignee) {
    errors.value.assignee = 'Please select assignee!';
    return;
  }

  // ✅ Skip API if reassign and no changes
  if (props.isReassign && formState.value.assignee === props.currentAssigneeId) {
    emit('close')
    return
  }

  isLoading.value = true
  errors.value.assignee = null

  await api.post('/api/task/assign', formState.value).then(res => {
    const task = res.data.data;
    emit('assigned', task);
    emit('close')
  })

  isLoading.value = false

}

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo)
}

const cancel = () => {
  emit('close')
}
</script>
