<template>
    <a-row>
        <a-col :span="24">
            <a-form-item :label="$t('file_types')" name="file_types"
                :rules="[{ required: true, message: t('validation.fileTypesRequired') }]"
                :validate-status="errors.file_types ? 'error' : ''" :help="errors.file_types">
                <a-select mode="multiple" v-model:value="formState.file_types" :placeholder="t('selectUpTo3FileTypes')"
                    :maxTagCount="3" :maxTagPlaceholder="() => '+ more'" :disabled="fileTypeList.length === 0"
                    :options="fileTypeList.map(type => ({ label: type, value: type }))" class="w-full"
                    @change="handleFileTypeChange" />
            </a-form-item>
        </a-col>
    </a-row>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({
    formState: Object,
    errors: Object,
    fileTypeList: Array,
});

const emit = defineEmits(['update:file_types']);
const { t } = useI18n();

function handleFileTypeChange(selected) {
    if (selected.length > 3) {
        // Limit to first 3
        const limited = selected.slice(0, 3);
        emit('update:file_types', limited);
    } else {
        emit('update:file_types', selected);
    }
}
</script>
