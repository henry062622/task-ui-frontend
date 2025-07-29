<template>
    <AuthLayout :title="$t('log_in_to_your_acc')" :description="$t('enter_ur_email_and_psw_below_to_log_in')">
        <div class=" shadow-xl bg-white p-5 rounded-xl">
            <!-- <div v-if="status" class="mb-4 text-center text-sm font-medium text-green-600">
                {{ status }}
            </div> -->
            <a-alert v-if="loginError" type="error" :message="loginError" show-icon class="mb-4" />

            <a-form :model="formState" name="horizontal_login" layout="vertical" autocomplete="off" @finish="onFinish"
                class="w-full" @finishFailed="onFinishFailed">
                <a-row>
                    <a-col span="24" class="!flex justify-center items-center !mb-3">
                        <a-select v-model:value="selectedLang" style="width: 120px" @change="changeLanguage">
                            <a-select-option value="en">
                                <div class="flex justify-start items-center gap-2">
                                    <img src="/uk.png" alt="english-flag" class=" size-4" />
                                    {{ $t('eng') }}
                                </div>
                            </a-select-option>
                            <a-select-option value="th">
                                <div class="flex justify-start items-center gap-2">
                                    <img src="/th.png" alt="thailand-flag" class=" size-4" />
                                    {{ $t('th') }}
                                </div>
                            </a-select-option>
                        </a-select>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col span="24">
                        <a-form-item :label="$t('email')" name="email"
                            :rules="[{ required: true, message: 'Please input your email!' }]"
                            :validate-status="errors.email ? 'error' : ''" :help="errors.email">
                            <a-input v-model:value="formState.email" class="w-full">
                            </a-input>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col span="24">
                        <a-form-item :label="$t('password')" name="password"
                            :rules="[{ required: true, message: 'Please input your password!' }]"
                            :validate-status="errors.password ? 'error' : ''" :help="errors.password">
                            <a-input-password v-model:value="formState.password">
                            </a-input-password>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row class="pt-3">
                    <a-col span="24">
                        <a-form-item>
                            <a-button type="primary" class="!bg-[#faf3e4] !w-full !shadow-none !text-[#213441]"
                                style="font-weight: 600;" html-type="submit" :loading="isLoading">{{ $t('login')
                                }}</a-button>
                        </a-form-item>
                    </a-col>
                </a-row>

            </a-form>
        </div>

    </AuthLayout>
</template>
<script setup>
import AuthLayout from '@/components/layout/AuthLayout.vue';
import { computed, ref } from 'vue';
import api, { ensureCsrfToken } from '@/lib/axios';
import router from '@/router';
import { useI18n } from 'vue-i18n'

const formState = ref({
    email: '',
    password: '',
});

const errors = ref({
    email: '',
    password: '',
});

const { locale } = useI18n()
const selectedLang = ref(locale.value)

const loginError = ref('');
const isLoading = ref(false);

const changeLanguage = () => {
    locale.value = selectedLang.value
    localStorage.setItem('lang', locale.value)
}

const onFinish = async (values) => {
    console.log('Success:', values);
    isLoading.value = true;
    errors.value.email = '';
    errors.value.password = '';
    loginError.value = '';

    // await ensureCsrfToken();
    try {
        await api.post('/api/login', formState.value).then(res => {
            console.log(res.data);
            sessionStorage.setItem('login_token', res.data.data.login_token);
            router.push('/two-factory/verify');
        });
    } catch (err) {
        console.log(err);
        const response = err?.response;

        if (!response || !response.data) return;

        const { errors: backendErrors, message } = response.data;

        if (backendErrors) {
            errors.value.email = backendErrors.email?.[0] || '';
            errors.value.password = backendErrors.password?.[0] || '';
        } else if (message) {
            loginError.value = message;
        } else {
            loginError.value = 'Something went wrong. Please try again.';
        }
    } finally {
        isLoading.value = false;
    }

};

const onFinishFailed = async (errorInfo) => {
    console.log('Failed:', errorInfo);
    const errorFields = errorInfo.errorFields;
    // Reset errors first
    errors.value.email = '';
    errors.value.password = '';

    errorFields.forEach(field => {
        if (field.name?.[0] === 'email') {
            errors.value.email = field.errors?.[0] || '';
        }
        if (field.name?.[0] === 'password') {
            errors.value.password = field.errors?.[0] || '';
        }
    })

};

const disabled = computed(() => {
    return !(formState.username && formState.password);
});
</script>