<template>
    <span class=" text-lg !font-medium">{{ $t('pf_info') }}</span>
    <p class=" text-gray-400 !font-medium">{{ $t('update_ur_name_and_email') }}</p>

    <a-form :model="formState" name="update_user" layout="vertical" autocomplete="off" @finish="onSubmit" class="w-full"
        @finishFailed="onFinishFailed">
        <a-row>
            <a-col :span="24">
                <a-form-item :label="$t('name')" name="name"
                    :rules="[{ required: true, message: 'please input User name!' }]"
                    :validate-status="errors.name ? 'error' : ''" :help="errors.name">
                    <a-input v-model:value="formState.name" class="w-full md:!w-1/2" />
                </a-form-item>
            </a-col>
        </a-row>

        <a-row>
            <a-col span="24">
                <a-form-item :label="$t('email')" name="email"
                    :rules="[{ required: true, message: 'Please input your email!' }]"
                    :validate-status="errors.email ? 'error' : ''" :help="errors.email">
                    <a-input v-model:value="formState.email" class="w-full md:!w-1/2">
                    </a-input>
                </a-form-item>
            </a-col>
        </a-row>

        <!-- role Dropdown -->
        <a-row>
            <a-col span="24">
                <a-form-item :label="$t('role')" name="role">
                    <a-input :value="user.role.name" class="w-full md:!w-1/2" disabled>
                    </a-input>
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Group Dropdown -->
        <a-row>
            <a-col span="24">
                <a-form-item :label="$t('group')" name="group">
                    <a-input :value="user.group ? user.group.name : 'N/A'" class="w-full md:!w-1/2" disabled>
                    </a-input>
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-start gap-4 pt-4">
            <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">{{ $t('update')
                }}</a-button>
        </div>
    </a-form>
</template>
<script setup>
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth';
import { notification } from 'ant-design-vue';
import { ref } from 'vue';

const props = defineProps({
    user: Object
});

const formState = ref({ name: props.user.name, email: props.user.email, role_id: props.user.role_id });
const errors = ref({ name: '', email: '' });
const isLoading = ref(false);
const auth = useAuthStore();

// Submission logic
const onSubmit = async () => {
    console.log(formState.value);
    isLoading.value = true
    errors.value.name = ''
    try {
        const res = await api.post(`/api/user/${props.user.id}/update`, formState.value);
        const title = res.data.status.charAt(0).toUpperCase() + res.data.status.slice(1);
        auth.user.name = res.data.data.name;
        auth.user.email = res.data.data.email;
        notification.success({
            message: title,
            description: res.data.message, // Display the message
            duration: 3,  // Duration for the notification
        });
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
</script>