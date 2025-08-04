<template>
    <a-upload :list-type="listType" :multiple="multiple" :file-list="fileList" :before-upload="beforeUpload"
        @change="handleChange" :accept="accept">
        <slot>
            <div>
                <plus-outlined />
                <div style="margin-top: 8px">{{ $t('upload') }}</div>
            </div>
        </slot>
    </a-upload>

    <a-alert v-if="errorMsg" type="error" :message="errorMsg" show-icon style="margin-top: 8px" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    listType: {
        type: String,
        default: 'picture-card'
    },
    multiple: {
        type: Boolean,
        default: true
    },
    allowedMimeTypes: {
        type: Array,
        default: () => [
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'application/pdf', // pdf
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'application/zip',
            'application/x-rar-compressed',
            // WPS MIME types (approximate)
            'application/vnd.ms-works',
            'application/wps-office',
            'application/vnd.ms-excel.sheet.macroenabled.12',
            'application/vnd.ms-powerpoint.presentation.macroenabled.12',
        ]
    },
    allowedExts: {
        type: Array,
        default: () => [
            'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf',
            'jpg', 'jpeg', 'png', 'gif', 'mp4', 'zip', 'rar',
            'wps', 'wpt', 'et', 'ett', 'dps', 'dpt'
        ]
    },
    accept: {
        type: String,
        default: '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.mp4,.zip,.rar,.wps,.wpt,.et,.ett,.dps,.dpt'
    }
})

const emit = defineEmits(['update:modelValue'])

const fileList = ref([...props.modelValue])
const errorMsg = ref('')

// Always return false to prevent auto upload
const beforeUpload = (file) => {
    const isAllowedType = props.allowedMimeTypes.includes(file.type)
    const extension = file.name.split('.').pop().toLowerCase()
    const isAllowedExt = props.allowedExts.includes(extension)

    if (!isAllowedType && !isAllowedExt) {
        errorMsg.value = t('validation.fileTypeNotSupported', {
            types: props.allowedExts.join(', ')
        })
        return false
    }
    errorMsg.value = ''
    return false
}

const handleChange = (info) => {
    // Manually update fileList, only keep files which passed beforeUpload
    const filteredList = info.fileList.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase()
        return props.allowedExts.includes(ext)
    })
    fileList.value = filteredList
    emit('update:modelValue', fileList.value)
}

watch(() => props.modelValue, (newVal) => {
    fileList.value = [...newVal]
})
</script>
