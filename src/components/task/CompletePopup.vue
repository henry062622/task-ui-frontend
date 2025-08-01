<template>
    <a-modal :open="visible" :title="$t('update_task_status')" :footer="null" :closable="false" centered>
        <a-divider></a-divider>

        <a-form :model="formState" name="update_task_status" layout="vertical" autocomplete="off" @finish="onSubmit"
            @finishFailed="onFinishFailed" class="w-full">

            <!-- Status selection -->
            <a-form-item :label="$t('status')" name="status"
                :rules="[{ required: true, message: 'Please select a status' }]">
                <a-radio-group v-model:value="formState.status">
                    <a-radio value="complete">Complete</a-radio>
                    <a-radio value="needs-revision">Need Revision</a-radio>
                </a-radio-group>
            </a-form-item>

            <!-- Revision reason (only if Need Revision) -->
            <a-form-item v-if="formState.status === 'needs-revision'" label="Revision Reason" name="revision_reason"
                :rules="[{ required: true, message: 'Please enter revision reason' }]">
                <a-textarea v-model:value="formState.revision_reason" rows="4"
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
import { ref, watch } from 'vue'
import api from '@/lib/axios'

const props = defineProps({
    visible: { type: Boolean, required: true },
    taskId: { type: Number, required: true }
})
const emit = defineEmits(['close', 'completed'])

const formState = ref({
    task_id: props.taskId,
    status: '',
    revision_reason: ''
})
const isLoading = ref(false)

watch(() => props.visible, (val) => {
    if (val) {
        formState.value.task_id = props.taskId
        formState.value.status = ''
        formState.value.revision_reason = ''
    }
})

const onSubmit = async () => {
    if (!formState.value.status) return

    isLoading.value = true

    const payload = {
        task_id: formState.value.task_id,
        status: formState.value.status,
        revision_reason: formState.value.status === 'needs-revision'
            ? formState.value.revision_reason
            : null
    }

    await api.post('/api/task/change-status', payload)
        .then(res => {
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
</script>
