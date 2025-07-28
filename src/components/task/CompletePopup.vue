<template>
    <a-modal :open="visible" title="Upload file(s)" :footer="null" :closable="false" centered>
        <a-divider></a-divider>

        <a-form :model="formState" name="assign_task" layout="vertical" autocomplete="off" @finish="onSubmit"
            class="w-full" @finishFailed="onFinishFailed">
            <!-- upload file -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="อัพโหลดไฟล์ที่เสร็จสิ้น / Upload finished file" name="file"
                        :rules="[{ required: true, message: 'Please upload at least one file' }]"
                        :validate-status="errors.file ? 'error' : ''" :help="errors.file">
                        <a-upload list-type="picture-card" multiple :file-list="formState.file"
                            :before-upload="() => false" @change="handleFileUpload">
                            <div>
                                <plus-outlined />
                                <div style="margin-top: 8px">Upload</div>
                            </div>
                        </a-upload>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-4">
                <a-button @click="cancel">Cancel</a-button>
                <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">submit</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
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
const emit = defineEmits(['close', 'completed'])

const formState = ref({ task_id: props.taskId, file: [] })
const errors = ref({ file: '' })
const isLoading = ref(false)

// Reset modal when opened
watch(() => props.visible, (val) => {
    if (val) {
        formState.value.task_id = props.taskId
        formState.value.file = []
        errors.value.assignee = ''
    }
})

const handleFileUpload = (info) => {
    // Only keep images and limit total number if needed
    const fileList = info.fileList.filter(file => {
        return file.type.startsWith('image/') || file.type.startsWith('video/');
    });

    formState.value.file = fileList;

    if (fileList.length === 0) {
        errors.value.file = 'กรุณาอัพโหลดไฟล์อย่างน้อยหนึ่งไฟล์ / Please upload at least one file';
    } else {
        errors.value.file = '';
    }
};

// Submission logic
const onSubmit = async () => {
    if (!formState.value.file.length) {
        errors.value.task_file = 'กรุณาอัพโหลดไฟล์อย่างน้อยหนึ่งไฟล์ / Please upload at least one file!';
        return;
    }

    isLoading.value = true
    errors.value.file = ''

    const formData = new FormData();
    formData.append('task_id', formState.value.task_id);
    formState.value.file.forEach((fileObj) => {
        const actualFile = fileObj.originFileObj;
        formData.append('files[]', actualFile);
    });

    await api.post('/api/task/complete', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
        const task = res.data.data;
        emit('completed', task);
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
