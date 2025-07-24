<template>
    <a-modal :open="visible" title="Assign the task" :footer="null" :closable="false" centered>
        <a-divider></a-divider>

        <a-form :model="formState" name="assign_task" layout="vertical" autocomplete="off" class="w-full">
            <!-- assignee -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Reason" name="cancel_reason"
                        :rules="[{ required: true, message: 'Please input cancel reason' }]"
                        :validate-status="errors.cancel_reason ? 'error' : ''" :help="errors.cancel_reason">
                        <a-textarea v-model:value="formState.cancel_reason" placeholder="Enter cancel reason"
                            :rows="4" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-4">
                <a-button @click="cancel">Cancel</a-button>
                <a-button type="primary" :disabled="isLoading" @click="onSubmit">Submit</a-button>
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
    taskId: {
        type: Number,
        required: true
    }
})
const emit = defineEmits(['close', 'cancelled'])

const formState = ref({ status: 'cancel', task_id: props.taskId, cancel_reason: '' })
const errors = ref({ cancel_reason: '' })
const isLoading = ref(false)

// Reset modal when opened
watch(() => props.visible, (val) => {
    if (val) {
        formState.value.task_id = props.taskId
        formState.value.cancel_reason = ''
        errors.value.cancel_reason = ''
    }
})

// Submission logic
const onSubmit = async () => {
    if (!formState.value.cancel_reason) {
        errors.value.cancel_reason = 'Please state cancel reason!';
        return;
    }

    isLoading.value = true
    errors.value.cancel_reason = ''

    await api.post('/api/task/change-status', formState.value).then(res => {
        const task = res.data.data;
        emit('cancelled', task);
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
