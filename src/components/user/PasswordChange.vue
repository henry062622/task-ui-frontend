<template>
    <span class=" text-lg !font-medium">Update password</span>
    <p class=" text-gray-400 !font-medium">Ensure your account is using a long, random password to stay secure</p>

    <a-form :model="formState" name="update_user" layout="vertical" autocomplete="off" @finish="onSubmit" class="w-full"
        @finishFailed="onFinishFailed">
        <a-row>
            <a-col :span="24">
                <a-form-item label="Current Password" name="current_password"
                    :rules="[{ required: true, message: 'please input your current password!' }]"
                    :validate-status="errors.current_password ? 'error' : ''" :help="errors.current_password">
                    <a-input-password v-model:value="formState.current_password"
                        class="w-full md:!w-1/2"></a-input-password>
                </a-form-item>
            </a-col>
        </a-row>

        <a-row>
            <a-col :span="24">
                <a-form-item label="New Password" name="new_password"
                    :rules="[{ required: true, message: 'please input your new password!' }]"
                    :validate-status="errors.new_password ? 'error' : ''" :help="errors.new_password">
                    <a-input-password v-model:value="formState.new_password"
                        class="!w-full md:!w-1/2"></a-input-password>
                </a-form-item>
            </a-col>
        </a-row>

        <a-row>
            <a-col :span="24">
                <a-form-item label="Confirm Password" name="confirm_password"
                    :rules="[{ required: true, message: 'please input your confirm password!' }]"
                    :validate-status="errors.confirm_password ? 'error' : ''" :help="errors.confirm_password">
                    <a-input-password v-model:value="formState.confirm_password"
                        class="w-full md:!w-1/2"></a-input-password>
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-start gap-4 pt-4">
            <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">Update</a-button>
        </div>
    </a-form>
</template>
<script setup>
import api from '@/lib/axios';
import { notification } from 'ant-design-vue';
import { ref } from 'vue';

const props = defineProps({
    user: Object
});

const formState = ref({ current_password: '', new_password: '', confirm_password: '' });
const errors = ref({ current_password: '', new_password: '', confirm_password: '' });
const isLoading = ref(false);

// Submission logic
const onSubmit = async () => {
    console.log(formState.value);
    errors.value = { current_password: '', new_password: '', confirm_password: '' };

    if (formState.value.new_password !== formState.value.confirm_password) {
        errors.value.confirm_password = 'New password and confirm password do not match!';
        isLoading.value = false;
        return;
    }
    try {
        const res = await api.post('/api/user/change-password', formState.value);
        notification.success({
            message: 'Password Updated',
            description: res.data.message, // Display the message
            duration: 3,  // Duration for the notification
        });
        // Reset form state
        formState.value = { current_password: '', new_password: '', confirm_password: '' };
    } catch (err) {
        const response = err?.response;

        if (!response || !response.data) return;

        const { errors: backendErrors, message } = response.data;

        // if (backendErrors) {
        //     errors.value.current_password = backendErrors.current_password?.[0] || '';
        //     errors.value.new_password = backendErrors.new_password?.[0] || '';
        // } else 
        if (message) {
            errors.value.current_password = message;
        }
    } finally {
        isLoading.value = false
    }
}

const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    const errorFields = errorInfo.errorFields;
    // Reset errors first
    errors.value = { current_password: '', new_password: '', confirm_password: '' };

    errorFields.forEach(field => {
        if (field.name?.[0] === 'current_password') {
            errors.value.current_password = field.errors?.[0] || '';
        }
        if (field.name?.[0] === 'new_password') {
            errors.value.new_password = field.errors?.[0] || '';
        }
        if (field.name?.[0] === 'confirm_password') {
            errors.value.confirm_password = field.errors?.[0] || '';
        }
    })
}
</script>