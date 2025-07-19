<template>
    <AuthLayout :title="title" :description="description">
        <div class=" shadow-xl bg-white p-5 rounded-xl">
            <!-- <div v-if="status" class="mb-4 text-center text-sm font-medium text-green-600">
                {{ status }}
            </div> -->
            <a-alert v-if="loginError" type="error" :message="loginError" show-icon class="mb-4" />
            <div class="w-full flex flex-col justify-center items-center text-center text-lg"
                v-if="!twoFactory.isEnabled">
                <a-qrcode :value="twoFactory.qr_url" />
                <p class="text-sm text-muted-foreground">Or manually enter the key</p>
                <b>{{ twoFactory.secret }}</b>
            </div>


            <a-form :model="formState" name="horizontal_login" layout="vertical" autocomplete="off" @finish="onFinish"
                class="w-full" @finishFailed="onFinishFailed">
                <a-row>
                    <a-col span="24">
                        <a-form-item label="Code" name="code"
                            :rules="[{ required: true, message: 'Please enter the 6 digit from your authentior app!' }]"
                            :validate-status="errors.code ? 'error' : ''" :help="errors.code">
                            <a-input v-model:value="formState.code" class="w-full"
                                placeholder="Enter 6-digit code from app">
                            </a-input>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row class="pt-3">
                    <a-col span="24">
                        <a-form-item>
                            <a-button type="primary" class="!bg-[#faf3e4] !w-full !shadow-none !text-[#213441]"
                                style="font-weight: 600;" html-type="submit" :loading="isLoading">Verify</a-button>
                        </a-form-item>
                    </a-col>
                </a-row>

            </a-form>
        </div>

    </AuthLayout>
</template>
<script setup>
import AuthLayout from '@/components/layout/AuthLayout.vue';
import { computed, onMounted, ref } from 'vue';
import api, { ensureCsrfToken } from '@/lib/axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

const formState = ref({
    code: '',
    loginToken: null
});

const errors = ref({
    code: '',
});

const twoFactory = ref({
    isEnabled: true,
    secret: null,
    qr_url: null
});

const title = ref('Two Factory Authentication Required');
const description = ref('Please enter the 6-digit code from your authentior app.')

const loginError = ref('');
const isLoading = ref(false);


const onFinish = async (values) => {
    console.log('Success:', values);
    isLoading.value = true;
    errors.value.code = '';

    try {
        const auth = useAuthStore();
        await api.post('/api/two-factory/verify', formState.value).then(res => {
            console.log(res);
            auth.user = res.data.data;
            auth.permissions = res.data.data.permissions;
        });
        router.push('/dashboard');

    } catch (err) {
        console.log(err);
        const response = err?.response;

        if (!response || !response.data) return;

        const { message } = response.data;

        if (message) {
            errors.value.code = message;
        }
    } finally {
        isLoading.value = false;
    }

};

const onFinishFailed = async (errorInfo) => {
    console.log('Failed:', errorInfo);

};

const disabled = computed(() => {
    return !(formState.username && formState.password);
});

const checkTwoFactoryForUser = async () => {
    const loginToken = sessionStorage.getItem('login_token');
    formState.value.loginToken = loginToken;
    await api.post('/api/two-factory/check', { loginToken })
        .then((res) => {
            const data = res.data.data;
            twoFactory.value.isEnabled = data.twoFaEnabledForUser;
            if (!twoFactory.value.isEnabled) {
                twoFactory.value.secret = data.secret;
                twoFactory.value.qr_url = data.qr_url;
                title.value = 'Setup Two-Factory Authentication';
                description.value = 'Please scan this qr cord with your authenticator app (e.g., Google Authenticator, Microsoft Authenticator)';
            }
        });
}

onMounted(() => {
    checkTwoFactoryForUser();
})
</script>