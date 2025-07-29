<template>
    <AuthLayout :title="t(title, { returnObjects: true })" :description="$t(description)">
        <div class=" shadow-xl bg-white p-5 rounded-xl">
            <!-- <div v-if="status" class="mb-4 text-center text-sm font-medium text-green-600">
                {{ status }}
            </div> -->
            <a-alert v-if="loginError" type="error" :message="loginError" show-icon class="mb-4" />
            <div class="w-full flex flex-col justify-center items-center text-center text-lg"
                v-if="!twoFactory.isEnabled">
                <a-qrcode :value="twoFactory.qr_url" />
                <p class="text-sm text-muted-foreground">{{ $t('twoFactor') }}</p>
                <b>{{ twoFactory.secret }}</b>
            </div>


            <a-form :model="formState" name="horizontal_login" layout="vertical" autocomplete="off" @finish="onFinish"
                class="w-full" @finishFailed="onFinishFailed">
                <a-row>
                    <a-col span="24" class="!flex justify-end items-center !mb-3">
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
                        <a-form-item :label="$t('twoFactor')" name="code"
                            :rules="[{ required: true, message: 'Please enter the 6 digit from your authentior app!' }]"
                            :validate-status="errors.code ? 'error' : ''" :help="errors.code">
                            <a-input v-model:value="formState.code" class="w-full"
                                :placeholder="$t('twoFactor.enter_6_digit_from_app')">
                            </a-input>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row class="pt-3">
                    <a-col span="24">
                        <a-form-item>
                            <a-button type="primary" class="!bg-[#faf3e4] !w-full !shadow-none !text-[#213441]"
                                style="font-weight: 600;" html-type="submit" :loading="isLoading">{{
                                    $t('twoFactor.verify')
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
import { computed, onMounted, ref } from 'vue';
import api, { ensureCsrfToken } from '@/lib/axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n'

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

const { locale, t } = useI18n()
const selectedLang = ref(locale.value)

const title = ref('twoFactor.required.title');
const description = ref('twoFactor.required.description')

const loginError = ref('');
const isLoading = ref(false);

const changeLanguage = () => {
    locale.value = selectedLang.value
    localStorage.setItem('lang', locale.value)
}

const onFinish = async (values) => {
    console.log('Success:', values);
    isLoading.value = true;
    errors.value.code = '';

    try {
        const auth = useAuthStore();
        await api.post('/api/two-factory/verify', formState.value).then(res => {
            console.log(res);
            auth.user = res.data.data.user;
            auth.permissions = res.data.data.user.permissions;
            const token = res.data.data.token
            localStorage.setItem('auth_token', token)
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
                title.value = 'twoFactor.setup.title';
                description.value = 'twoFactor.setup.description';
            }
        });
}

onMounted(() => {
    checkTwoFactoryForUser();
})
</script>