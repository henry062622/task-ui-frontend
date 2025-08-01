<template>
    <DefaultLayout>
        <!-- warpper  -->
        <div class="flex h-full w-full flex-1 flex-col px-4">
            <!-- tabs -->
            <a-tabs v-if="tabs.length > 0" v-model:activeKey="activeTab" @change="onTabChange">
                <a-tab-pane v-for="tab in tabs" :key="tab.value" :tab="$t(tab.label)"
                    class="gap-4 h-full rounded-xl shadow-2xl p-4 pt-4 w-full mx-auto">

                    <!-- Search and Filters -->
                    <div class="flex justify-between items-center !mb-4">
                        <a-select v-if="currentTab?.filters.includes('file_type')" v-model:value="filters.file_type"
                            :placeholder="$t('type')" @change="handleFilter" allow-clear style="width: 220px">
                            <a-select-option v-for="type in taskTypeList" :key="type.id" :value="type.id"> {{ type.name
                            }} </a-select-option>
                        </a-select>

                        <a-select v-if="currentTab?.filters.includes('model_type')" v-model:value="filters.model_type"
                            :placeholder="$t('select_model_list')" @change="handleFilter" allow-clear
                            style="width: 220px">
                            <a-select-option v-for="site in websiteList" :key="site.id" :value="site.id">
                                model{{ site.name }}
                            </a-select-option>
                            <a-select-option value="other">modelOther</a-select-option>
                        </a-select>

                        <a-select v-if="currentTab?.filters.includes('decorative_type')"
                            v-model:value="filters.decorative_type" :placeholder="$t('select')" @change="handleFilter"
                            allow-clear style="width: 220px">
                            <a-select-option v-for="type in decorativeTypeList" :key="type.key" :value="type.key">
                                {{ type.value }}
                            </a-select-option>
                        </a-select>

                        <a-button v-if="currentTab?.buttons?.includes('create')" type="primary" @click="showPopUp"
                            class="!flex items-center">
                            <PlusOutlined class="!text-white" /> {{
                                $t('new_upload') }}
                        </a-button>

                        <!-- <a-select v-if="currentTab?.filters.includes('assignee')" v-model:value="filters.assignee"
                            :placeholder="$t('assignee')" @change="handleFilter" allow-clear style="width: 180px">
                            <a-select-option v-for="user in userList" :key="user.id" :value="user.id"> {{ user.name
                                }} </a-select-option>
                        </a-select> -->
                    </div>

                    <div class="flex h-auto justify-start items-center w-full gap-3 !mt-4 flex-wrap ">
                        <ImageList v-if="currentTab.value != 'all_tasks' && files.length > 0" :image-list="files" />
                        <div v-else-if="currentTab.value == 'all_tasks' && files.length > 0"
                            class="flex h-auto min-h-[65vh] gap-4 !mt-4 flex-wrap w-full">
                            <div v-for="file in files" :key="file.storage_url">
                                <!-- Image: keep original style -->
                                <div v-if="isImage(file.storage_url)" class="relative w-[120px]">
                                    <!-- Image -->
                                    <ImageView :image="file" />
                                </div>

                                <!-- Video: enforce 16:9 aspect ratio -->
                                <div v-else-if="isVideo(file.storage_url)"
                                    class="w-[250px] rounded-lg overflow-hidden border border-gray-200">
                                    <video controls class="aspect-[16/9] object-fill">
                                        <source :src="file.storage_url" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>

                                <!-- ZIP/RAR: show icon, filename, and download -->
                                <div v-else-if="isArchive(file.storage_url)"
                                    class="relative w-[120px] aspect-[4/5] flex flex-col gap-4 items-center justify-center border border-gray-200 rounded-lg bg-gray-100 py-4 px-2">

                                    <div>
                                        <file-zip-outlined class="text-4xl mb-2" />
                                    </div>
                                    <div class="text-xs text-gray-700 text-center truncate w-[90px]">
                                        {{ file.file_name || 'Archive' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="h-[70vh] w-full flex justify-center items-center">
                            No Files For Selected Type
                        </div>
                    </div>

                    <a-pagination class="!mt-2 flex justify-end" :current="pagination.current"
                        :page-size="pagination.pageSize" :total="pagination.total" width="100%" show-quick-jumper
                        @change="handlePageChange" show-less-items />

                </a-tab-pane>
            </a-tabs>
        </div>
        <ModelCreatePopup v-if="showModelPopup" :visible="showModelPopup" :modelTypeList="websiteList"
            :loading="loading" @close="showModelPopup = false" @submit="submitModelCreate" />
        <DecorativeCreatePopup v-if="showDecorativePopup" :visible="showDecorativePopup"
            :decorativeTypeList="decorativeTypeList" :loading="loading" @close="showDecorativePopup = false"
            @submit="submitDecorativeCreate" />
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import api from '@/lib/axios';
import router from '@/router';
import { computed, onMounted, reactive, ref } from 'vue';
import ImageList from '@/components/ui/ImageList.vue';
import ModelCreatePopup from '@/components/system_files/ModelCreatePopup.vue';
import DecorativeCreatePopup from '@/components/system_files/DecorativeCreatePopup.vue';
import ImageView from '@/components/ui/ImageView.vue';
import { FileZipOutlined, PlusOutlined } from '@ant-design/icons-vue';

const breadcrumbList = ref(['manager', 'dashboard']);

const activeTab = ref('');
const loading = ref(false);
const tabs = ref([
    { value: 'all_tasks', label: 'all_tasks', filters: ['file_type'] },
    { value: 'models', label: 'models', filters: ['model_type'], buttons: ['create'] },
    { value: 'decorative', label: 'decorative', filters: ['decorative_type'], buttons: ['create'] },
]);
const filters = reactive({ file_type: null, model_type: null, decorative_type: null });
const pagination = reactive({
    current: 1,
    pageSize: 40,
    total: 0,
});
const files = ref([]);
const taskTypeList = ref([]);
const websiteList = ref([]);
const decorativeTypeList = ref([]);
const showModelPopup = ref(false);
const showDecorativePopup = ref(false);

const currentTab = computed(() => tabs.value.find((t) => t.value === activeTab.value));

const endpointMap = {
    all_tasks: '/api/task-submisstion/files',
    models: '/api/get-actor-image-list',
    decorative: '/api/get-decorative-image-list',
};

const showPopUp = () => {
    console.log(currentTab.value);
    if (currentTab.value.value == 'models') {
        showModelPopup.value = true;
    } else {
        showDecorativePopup.value = true;
    }
}

const fetchFiles = async (page = 1) => {
    loading.value = true;
    try {
        const res = await api.get(endpointMap[activeTab.value], {
            params: {
                page,
                file_type: filters.file_type,
                website: filters.model_type,
                type: filters.decorative_type,
                page_size: pagination.pageSize,
                order_by: 'DESC'
            }
        });

        files.value = res.data.data.data;
        pagination.total = res.data.data.total;
        pagination.current = res.data.data.current_page;
    } catch (err) {
        console.error('Fetch error', err);
    } finally {
        loading.value = false;
    }
};

const submitDecorativeCreate = async (formData) => {
    loading.value = true;
    console.log(formData);
    const res = await api.post('/api/decorative-create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    console.log(res.data);
    loading.value = false;
    fetchFiles(1);
    showDecorativePopup.value = false;
    // Refresh, close modal etc.
}

const submitModelCreate = async (formState) => {
    loading.value = true;
    const formData = new FormData()
    console.log(formState);
    formData.append('website_id', formState.selectedId)
    formData.append('website_name', formState.selectedName)
    formState.fileList.forEach((fileObj) => {
        const actualFile = fileObj.originFileObj;
        formData.append('files[]', actualFile);
    });
    const res = await api.post('/api/models-create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    loading.value = false;
    fetchFiles(1);
    showModelPopup.value = false;
    // Refresh, close modal etc.
}

const handleFilter = () => {
    fetchFiles(1);
}

const onTabChange = () => {
    pagination.current = 1;
    Object.assign(filters, { file_type: null, model_type: null, decorative_type: null });
    fetchFiles(1);
};

const handlePageChange = (page, pageSize) => {
    pagination.pageSize = pageSize;
    fetchFiles(page);
};

const getTaskTypeList = () => {
    api.get('/api/get-task-type-name-list').then(res => {
        taskTypeList.value = res.data.data;
    });
}

const fetchWebsitelist = async () => {
    const res = await api.get('/api/websites');
    websiteList.value = res.data.data;
}

const fetchDecorativeTypes = async () => {
    const res = await api.get('/api/get-decorative-types');
    decorativeTypeList.value = res.data.data;
};

const isImage = (url) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);
};

const isVideo = (url) => {
    return /\.(mp4|mov|webm|ogg|mkv)$/i.test(url);
};

const isArchive = (url) => {
    return /\.(zip|rar)$/i.test(url);
};

onMounted(() => {
    activeTab.value = tabs.value[0]?.value || '';
    getTaskTypeList();
    fetchWebsitelist();
    fetchDecorativeTypes();
    fetchFiles();
})
</script>