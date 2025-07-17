<template>
    <DefaultLayout :breadcrumbList="breadcrumbList">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="relative h-full flex-1 space-y-6">
                <!-- Header with Create Button -->
                <div class="flex justify-end mx-4 mt-4 items-center">
                    <a-button type="primary" @click="clickCreateBtn"> Create </a-button>
                </div>
                <a-table :columns="columns" :data-source="data" class="pt-4" bordered>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.dataIndex === 'creator'">
                            <span>{{ record.creator.name }}</span>
                        </template>
                        <template v-if="column.dataIndex === 'action'">
                            <a-popconfirm title="Sure to delete?" @confirm="deleteIpWhitelist(record.id)">
                                <DeleteOutlined style="color: red;" />
                            </a-popconfirm>
                        </template>
                    </template>
                </a-table>

                <a-modal :open="showModal" title="Create a IP Whitelist" :footer="null" :closable="false" centered>
                    <a-divider></a-divider>
                    <a-form :model="formState" name="horizontal_login" layout="vertical" autocomplete="off"
                        @finish="onFinish" class="w-full" @finishFailed="onFinishFailed">
                        <a-row>
                            <a-col :span="24">
                                <a-form-item label="Ip Address" name="ip_address"
                                    :rules="[{ required: true, message: 'please input your ip address!' }]"
                                    :validate-status="errors.ip_address ? 'error' : ''" :help="errors.ip_address">
                                    <a-input v-model:value="formState.ip_address" class="w-full">
                                    </a-input>
                                </a-form-item>
                            </a-col>
                        </a-row><a-row>
                            <a-col :span="24">
                                <a-form-item label="Description" name="description">
                                    <a-input v-model:value="formState.description" class="w-full">
                                    </a-input>
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <div class="flex items-center justify-end gap-4">
                            <a-button @click="closeModel">Cancel</a-button>
                            <a-button html-type="submit" type="primary" :disabled="isLoading">Create</a-button>
                        </div>
                    </a-form>
                </a-modal>
                <!-- <Create v-model:showModal="showModal" @closePopupModel="closeModel"></Create> -->

            </div>
        </div>
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import { onMounted, ref } from 'vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import api from '@/lib/axios';

const breadcrumbList = ref(['Ip Whitelist', 'List']);

const columns = ref([
    {
        title: 'Ip Address',
        dataIndex: 'ip_address',
        key: 'ip_address'
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description'
    },
    {
        title: 'Created By',
        dataIndex: 'creator',
        key: 'creator'
    },
    {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
    },
]);

const formState = ref({
    ip_address: '',
    description: null
});

const errors = ref({
    ip_address: '',
});

const data = ref([]);
const showModal = ref(false);
const isLoading = ref(false);

const clickCreateBtn = () => {
    showModal.value = true;
}

const closeModel = () => {
    showModal.value = false;
}

const onFinish = async () => {
    isLoading.value = true;
    errors.value.ip_address = '';

    try {
        await api.post('/api/ip-whitelist', formState.value)
            .then(res => {
                //after create, push to the
                data.value.push(res.data.data);
            })
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
        showModal.value = false;
        formState.value.ip_address = "";
        formState.value.description = "";
    }
}

const onFinishFailed = async () => {
    console.log('Failed:', errorInfo);
}

const fetchIpWhitelist = async () => {
    await api.get('/api/ip-whitelist')
        .then(res => {
            data.value = res.data.data;
        })
}

const deleteIpWhitelist = async (id) => {
    await api.delete(`/api/ip-whitelist/${id}`)
        .then(res => {
            if (res.status == 200) {
                //remove from the list
                data.value = data.value.filter(item => item.id !== id);
            }
        });
}

onMounted(() => {
    fetchIpWhitelist();
})
</script>