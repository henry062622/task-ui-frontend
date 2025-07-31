<template>
    <a-modal :open="visible" :title="$t('create_decorative')" @cancel="close" :footer="null">
        <a-form :model="formState" layout="vertical" @finish="onSubmit">
            <!-- Dropdown -->
            <a-form-item :label="$t('theme')" name="selectedKey"
                :rules="[{ required: true, message: 'please select the type of decorative images!' }]">
                <a-select v-model:value="formState.selectedKey" :placeholder="$t('select')">
                    <a-select-option v-for="option in decorativeTypeList" :key="option.key" :value="option.key">
                        {{ option.value }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <!-- Upload -->
            <a-form-item :label="$t('upload_files')" name="fileList" :rules="[{ required: true }]">
                <a-upload-dragger v-model:file-list="formState.fileList" :before-upload="() => false" :multiple="true"
                    accept="image/*" list-type="picture">
                    <p class="ant-upload-drag-icon"><inbox-outlined /></p>
                    <p class="ant-upload-text">Drag and drop or click to upload</p>
                    <p class="ant-upload-hint">
                        <!-- {{ $t('support_bulk_upload') }} -->
                    </p>
                </a-upload-dragger>
            </a-form-item>

            <!-- Footer -->
            <div class="flex justify-end gap-2">
                <a-button @click="close">{{ $t('cancel') }}</a-button>
                <a-button type="primary" html-type="submit" :loading="loading">{{ $t('submit') }}</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { InboxOutlined } from '@ant-design/icons-vue'

const props = defineProps({
    visible: Boolean,
    decorativeTypeList: Array,
    loading: Boolean,
})
const emit = defineEmits(['close', 'submit'])

const formState = ref({
    selectedKey: null,
    fileList: []
})

const close = () => emit('close')

// Get selected text from decorativeTypeList
const selectedValue = computed(() => {
    const found = props.decorativeTypeList.find(opt => opt.key === formState.value.selectedKey)
    return found ? found.value : ''
})

const onSubmit = () => {
    if (!formState.value.selectedKey || formState.value.fileList.length === 0) return
    const formData = new FormData()
    formData.append('theme_key', formState.value.selectedKey)
    formData.append('theme_value', selectedValue.value)
    formState.value.fileList.forEach((f, i) => formData.append(`files[${i}]`, f.originFileObj))
    emit('submit', formData)
}
</script>
