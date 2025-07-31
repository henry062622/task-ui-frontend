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
                        <a-upload list-type="picture-card" multiple :file-list="formState.file"
                            :before-upload="() => false" @change="handleFileUpload">
                            <div>
                                <plus-outlined />
                                <div style="margin-top: 8px">{{ $t('upload') }}</div>
                            </div>
                        </a-upload>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-4">
                <a-button @click="cancel">{{ $t('cancel') }}</a-button>
                <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">{{ $t('submit')
                    }}</a-button>
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
    },
    task: {
        type: Object,
        default: null
    }
})
const emit = defineEmits(['close', 'submitTask'])

const formState = ref({ task_id: props.taskId, file: [] })
const errors = ref({ file: '' })
const isLoading = ref(false)

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

        errors.value.assignee = ''
    }
})

const handleFileUpload = (info) => {
    // Only keep images and limit total number if needed
    const fileList = info.fileList.filter(file => {
        if (file.type) {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) return true;
            if (file.type === 'application/zip') return true;
        }
        // Allow zip/rar by extension (type might be blank)
        const ext = file.name?.split('.').pop()?.toLowerCase();
        if (ext === 'zip' || ext === 'rar') return true;
        // Also allow objects without 'type' (already uploaded files)
        return true;
    });
    // const fileList = info.fileList.filter(file => {
    //     return file.type.startsWith('image/') || file.type.startsWith('video/');
    // });

    formState.value.file = fileList;

    if (fileList.length === 0) {
        errors.value.file = 'กรุณาอัพโหลดไฟล์อย่างน้อยหนึ่งไฟล์ (ภาพ, วิดีโอ, ZIP, RAR) / Please upload at least one file (image, video, ZIP, RAR)';
    } else {
        errors.value.file = '';
    }
};

// Submission logic
const onSubmit = async () => {
    if (!formState.value.file.length) {
        errors.value.task_file = 'กรุณาอัพโหลดไฟล์อย่างน้อยหนึ่งไฟล์ (ภาพ, วิดีโอ, ZIP, RAR) / Please upload at least one file (image, video, ZIP, RAR)';
        return;
    }

    // isLoading.value = true
    errors.value.file = ''
    console.log(formState.value);

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
    // formState.value.file.forEach((fileObj) => {
    //     const actualFile = fileObj.originFileObj;
    //     formData.append('files[]', actualFile);
    // });

    await api.post('/api/task/submit-for-review', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
        const task = res.data.data;
        emit('submitTask', task);
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
