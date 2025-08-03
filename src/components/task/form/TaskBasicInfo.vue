<template>
    <a-row :gutter="16">
        <a-col :span="24">
            <a-form-item :label="$t('job_title')" name="job_title"
                :rules="[{ required: true, message: t('validation.jobTitleRequired') }]"
                :validate-status="errors.job_title ? 'error' : ''" :help="errors.job_title">
                <a-input v-model:value="formState.job_title" :placeholder="$t('enterProjectOrTask')" />
            </a-form-item>
        </a-col>

        <a-col :span="formState.task_type === 'custom' ? 12 : 24">
            <a-form-item :label="$t('task_type')" name="task_type"
                :rules="[{ required: true, message: t('validation.taskTypeRequired') }]"
                :validate-status="errors.task_type ? 'error' : ''" :help="errors.task_type">
                <a-select v-model:value="formState.task_type" :placeholder="$t('selectTaskType')"
                    @change="onTaskTypeChange">
                    <a-select-option value="custom">{{ $t('custom') }}</a-select-option>
                    <a-select-option v-for="task in taskTypeList" :key="task.id" :value="task.id">
                        {{ task.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>
        </a-col>

        <a-col v-if="formState.task_type === 'custom'" :span="12">
            <a-form-item :label="$t('custom_task_type')" name="custom_task_type"
                :rules="[{ required: true, message: t('validation.customTaskTypeRequired') }]"
                :validate-status="errors.custom_task_type ? 'error' : ''" :help="errors.custom_task_type">
                <a-input v-model:value="formState.custom_task_type" :placeholder="$t('enterNewTaskType')" />
            </a-form-item>
        </a-col>

        <a-col :span="formState.size === 'custom' ? 12 : 24">
            <a-form-item :label="$t('size')" name="size"
                :rules="[{ required: true, message: t('validation.sizeRequired') }]"
                :validate-status="errors.size ? 'error' : ''" :help="errors.size">
                <a-select v-model:value="formState.size" :disabled="!formState.task_type"
                    :placeholder="!formState.task_type ? $t('pleaseSelectTaskTypeFirst') : $t('selectSize')">
                    <template v-if="formState.task_type === 'custom'">
                        <a-select-option value="custom">{{ $t('custom') }}</a-select-option>
                    </template>
                    <template v-else>
                        <a-select-option value="custom">{{ $t('custom') }}</a-select-option>
                        <a-select-option v-for="size in sizeList" :key="size.id" :value="size.id">
                            {{ size.name }}
                        </a-select-option>
                    </template>
                </a-select>
            </a-form-item>
        </a-col>

        <a-col v-if="formState.size === 'custom'" :span="12">
            <a-form-item :label="$t('custom_size')" name="custom_size"
                :rules="[{ required: true, message: t('validation.customSizeRequired') }]"
                :validate-status="errors.custom_size ? 'error' : ''" :help="errors.custom_size">
                <a-input v-model:value="formState.custom_size" :placeholder="$t('enterCustomSize')" />
            </a-form-item>
        </a-col>
    </a-row>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({
    formState: Object,
    errors: Object,
    taskTypeList: Array,
    sizeList: Array,
});

const emit = defineEmits(['update:formState']);

const { t } = useI18n();

function onTaskTypeChange(value) {
    // Clear size when taskType changes
    props.formState.size = null;
    if (value === 'custom') {
        props.sizeList.length = 0;
    } else if (value) {
        // Emit event for parent to fetch sizes by task type
        emit('task-type-change', value);
    }
}
</script>
