<template>
    <a-modal :open="visible" title="Create an IP Whitelist" :footer="null" :closable="false" centered>
        <a-divider></a-divider>

        <a-form :model="formState" name="create_ip_whitelist" layout="vertical" autocomplete="off" @finish="onFinish"
            @finishFailed="onFinishFailed">
            <!-- Ip Address -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Ip Address" name="ip_address"
                        :rules="[{ required: true, message: 'please input your ip address!' }]"
                        :validate-status="errors.ip_address ? 'error' : ''" :help="errors.ip_address">
                        <a-input v-model:value="formState.ip_address" class="w-full">
                        </a-input>
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Description" name="description">
                        <a-input v-model:value="formState.description" class="w-full">
                        </a-input>
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-4">
                <a-button @click="closeModal">Cancel</a-button>
                <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">Create</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/lib/axios';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['close', 'created']);

const formState = ref({
    ip_address: '',
    description: '',
});

const errors = ref({
    ip_address: '',
});

const isLoading = ref(false);

const onFinish = async () => {
    isLoading.value = true;
    errors.value.ip_address = '';

    try {
        await api.post('/api/ip-whitelist', formState.value);
        emit('created'); // Emit event to parent to refresh the list
        emit('close');
    } catch (err) {
        console.log(err);
        const response = err?.response;

        if (!response || !response.data) return;

        const { message } = response.data;

        if (message) {
            errors.value.ip_address = message;
        }
    } finally {
        isLoading.value = false;
    }
};

const closeModal = () => {
    errors.value.ip_address = '';
    emit('close');
};

const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    errors.value.ip_address = errorInfo.errorFields[0].errors[0];
};
</script>
