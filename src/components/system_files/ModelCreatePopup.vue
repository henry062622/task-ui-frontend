<template>
    <a-modal :open="visible" :title="$t('create_model')" @cancel="close" :footer="null">
        <a-form :model="formState" layout="vertical" @finish="onSubmit">
            <!-- Dropdown -->
            <a-form-item :label="$t('website')" name="selectedId"
                :rules="[{ required: true, message: 'please select the model type of images!' }]">
                <a-select v-model:value="formState.selectedId" :placeholder="$t('select_model_list')">
                    <a-select-option v-for="site in modelTypeList" :key="site.id" :value="site.id">
                        model{{ site.name }}
                    </a-select-option>
                    <a-select-option value="other">modelOther</a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item :label="$t('upload_files')" name="fileList"
                :rules="[{ required: true, message: 'please upload the images!' }]">
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
import { ref, computed, watch } from 'vue'
import { InboxOutlined } from '@ant-design/icons-vue'

const props = defineProps({
    visible: Boolean,
    modelTypeList: Array,
    loading: Boolean,
})
const emit = defineEmits(['close', 'submit'])

const formState = ref({
    selectedId: null,
    fileList: [],
    selectedName: null
})


const close = () => emit('close')

// Get selected name from modelTypeList
const selectedName = computed(() => {
    const found = props.modelTypeList.find(opt => opt.id === formState.value.selectedId)
    return found ? `model${found.name}` : 'modelOther'
})

const onSubmit = () => {
    if (!formState.value.selectedId || formState.value.fileList === 0) return
    formState.value.selectedName = selectedName.value;
    emit('submit', formState.value)
}
</script>
