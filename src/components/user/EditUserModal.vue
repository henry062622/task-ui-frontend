<template>
    <a-modal :open="visible" title="Update a User" :footer="null" :closable="false" centered>
        <a-divider></a-divider>

        <a-form :model="formState" name="update_user" layout="vertical" autocomplete="off" @finish="onSubmit"
            class="w-full" @finishFailed="onFinishFailed">
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Name" name="name"
                        :rules="[{ required: true, message: 'please input User name!' }]"
                        :validate-status="errors.name ? 'error' : ''" :help="errors.name">
                        <a-input v-model:value="formState.name" class="w-full" autocomplete="new-password" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row>
                <a-col span="24">
                    <a-form-item label="Email" name="email"
                        :rules="[{ required: true, message: 'Please input your email!' }]"
                        :validate-status="errors.email ? 'error' : ''" :help="errors.email">
                        <a-input v-model:value="formState.email" class="w-full" autocomplete="new-password">
                        </a-input>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Group Dropdown -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Group" name="group_id">
                        <a-select v-model:value="formState.group_id" placeholder="Select Group" class="w-full">
                            <a-select-option v-for="group in groupList" :key="group.id" :value="group.id">
                                {{ group.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Websites Selection (Multiple) -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Websites">
                        <a-select v-model:value="formState.website_ids" mode="multiple" placeholder="Select Websites"
                            class="w-full">
                            <a-select-option v-for="website in websiteList" :key="website.id" :value="website.id">
                                {{ website.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-4 pt-4">
                <a-button @click="cancel">Cancel</a-button>
                <a-button html-type="submit" type="primary" :disabled="isLoading">Update</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/lib/axios'

const props = defineProps({
    visible: Boolean,
    groupList: Array,
    websiteList: Array,
    user: Object
})
const emit = defineEmits(['close', 'updated'])

const formState = ref({ name: '', email: '', group_id: '', website_ids: [] });
const errors = ref({ name: '', email: '' });
const isLoading = ref(false);

// Reset modal when opened
watch(() => props.visible, (val) => {
    if (val && props.user) {
        formState.value.name = props.user.name
        formState.value.email = props.user.email
        formState.value.group_id = props.user.group_id
        formState.value.website_ids = props.user.websites.map(w => w.id)
        errors.value.name = ''
        errors.value.email = ''
    }
})

// Submission logic
const onSubmit = async () => {
    console.log(formState.value);
    isLoading.value = true
    errors.value.name = ''
    try {
        await api.post(`/api/user/${props.user.id}/update`, formState.value)
        emit('updated')
        emit('close')
    } catch (err) {
        const response = err?.response;

        if (!response || !response.data) return;

        const { errors: backendErrors } = response.data;

        if (backendErrors) {
            errors.value.name = backendErrors.name?.[0] || '';
            errors.value.email = backendErrors.email?.[0] || '';
        }
    } finally {
        isLoading.value = false
    }
}

const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
}

const cancel = () => {
    emit('close')
}
</script>
