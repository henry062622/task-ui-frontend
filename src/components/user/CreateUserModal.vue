<template>
    <a-modal :open="visible" title="Create a User" :footer="null" :closable="false" centered>
        <a-divider></a-divider>

        <a-form :model="formState" name="create_user" layout="vertical" autocomplete="off" @finish="onSubmit"
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
            <a-row>
                <a-col span="24">
                    <a-form-item label="Password" name="password"
                        :rules="[{ required: true, message: 'Please input your password!' }]"
                        :validate-status="errors.password ? 'error' : ''" :help="errors.password">
                        <a-input-password v-model:value="formState.password" autocomplete="new-password">
                        </a-input-password>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- role Dropdown -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Role" name="role_id"
                        :rules="[{ required: true, message: 'Please select a role!' }]"
                        :validate-status="errors.role_id ? 'error' : ''" :help="errors.role_id">
                        <a-select v-model:value="formState.role_id" placeholder="Select Role" class="w-full">
                            <a-select-option v-for="role in roleList" :key="role.id" :value="role.id">
                                {{ role.name }}
                            </a-select-option>
                        </a-select>
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
                <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">Create</a-button>
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
    roleList: Array,
})
const emit = defineEmits(['close', 'created'])

const formState = ref({ name: '', email: '', password: '', role_id: '', group_id: '', website_ids: [] });
const errors = ref({ name: '', email: '', password: '', role_id: '' });
const isLoading = ref(false);

// Reset modal when opened
watch(() => props.visible, (val) => {
    if (val) {
        formState.value.name = ''
        formState.value.email = ''
        formState.value.password = ''
        formState.value.role_id = ''
        formState.value.group_id = ''
        formState.value.website_ids = []
        errors.value.name = ''
        errors.value.email = ''
        errors.value.password = ''
        errors.value.role_id = ''
    }
})

// Submission logic
const onSubmit = async () => {
    console.log(formState.value);
    isLoading.value = true
    errors.value.name = ''
    try {
        await api.post('/api/user/create', formState.value)
        emit('created')
        emit('close')
    } catch (err) {
        const response = err?.response;

        if (!response || !response.data) return;

        const { errors: backendErrors } = response.data;

        if (backendErrors) {
            errors.value.name = backendErrors.name?.[0] || '';
            errors.value.email = backendErrors.email?.[0] || '';
            errors.value.password = backendErrors.password?.[0] || '';
            errors.value.role_id = backendErrors.role_id?.[0] || '';
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
