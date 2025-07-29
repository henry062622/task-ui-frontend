<template>
    <div class="flex flex-col !gap-4">
        <a-row :gutter="16">
            <a-col :span="6">
                <h2 class="!font-bold text-3xl">{{ $t('title') }}</h2>
            </a-col>
            <a-col :span="18">
                <div class="flex gap-2 justify-end">
                    <a-button v-if="hasEditPermission && task.status != 'complete'" @click="emit('clickEdit')"
                        class="!flex items-center justify-center gap-1">
                        <EditOutlined />
                        {{ $t('edit') }}
                    </a-button>
                    <a-button v-if="task.status == 'pending' && task.assignee?.id == userId"
                        @click="updateTaskStatus('in-progress')">
                        {{ $t('in_progress') }}
                    </a-button>

                    <a-button v-if="task.status == 'in-progress' && task.assignee?.id == userId"
                        @click="clickCompleteBtn()">
                        {{ $t('complete') }}
                    </a-button>

                    <a-button v-if="task.status != 'cancel' && task.status != 'complete' && task.assignee?.id == userId"
                        danger @click="clickCancelBtn()">
                        {{ $t('cancel') }}
                    </a-button>

                    <a-button v-if="task.assignee == null && uiRoleId != userRoleId" @click="assignTask(task.id)"
                        class="!flex items-center justify-center gap-1">
                        <Icon icon="teenyicons:send-outline" />
                        {{ $t('assign') }}
                    </a-button>
                </div>

            </a-col>
        </a-row>

        <!-- title and task type -->
        <a-row :gutter="16">
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('job_title') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="task.job_title" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('task_type') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="task.type.name" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
        <!-- website and status -->
        <a-row :gutter="16">
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('website') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="task.website.name" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('status') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-tag :color="getColor(task.status)"> {{ task.status }}</a-tag>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
        <!-- size and file type -->
        <a-row :gutter="16">
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('size') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="task.size.name" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('file_types') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="changeToArray(task.file_types)" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
        <!-- colors and themes -->
        <a-row :gutter="16">
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('colors') }} :
                    </a-col>
                    <a-col :span="18">
                        <div class="flex h-14 gap-6 items-center pt-2 !mb-2">
                            <div v-for="code in changeToArray(task.colors)" :key="code"
                                class="flex flex-col items-center">
                                <div @click="copyColor(code)" :style="{ backgroundColor: code }"
                                    class="size-16 rounded-lg shadow border border-gray-300 cursor-pointer"
                                    :title="code"></div>
                                <span class="mt-1 text-xs text-gray-600 select-text">{{ code }}</span>
                            </div>
                        </div>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('themes') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-tag v-for="theme in task.themes" color="#2db7f5" class="!mt-2"> {{ theme.text }}</a-tag>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
        <!-- text in image and task description -->
        <a-row :gutter="16">
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('image_text') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-textarea :value="task.image_text" class="w-full" readonly></a-textarea>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('task_description') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-textarea :value="task.task_description" class="w-full" readonly></a-textarea>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
        <!-- created By and created At -->
        <a-row :gutter="16">
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('created_by') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="task.created_by.name" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('duedate') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="formatDate(task.deadline)" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12" v-if="uiRoleId != user.role_id" class="!mt-2">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('created_at') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="formatDate(task.created_at)" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>

        </a-row>

        <!-- assigned By and assignee -->
        <a-row :gutter="16">
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('assigned_by') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="task.assigned_by?.name ?? ''" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('assignee') }} :
                    </a-col>
                    <a-col :span="18">
                        <a-input :value="task.assignee?.name ?? ''" class="w-full" readonly></a-input>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
        <a-row :gutter="16" v-if="task.status == 'cancel'">
            <a-col :span="12">
                <a-row>
                    <a-col :span="6" class="!font-semibold !text-base">
                        {{ $t('cancel_reason') }}:
                    </a-col>
                    <a-col :span="18">
                        <a-textarea :value="task.cancel_reason" class="w-full" readonly></a-textarea>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
        <a-row :gutter="16" v-if="task.status == 'complete'">
            <a-col :span="24" class="!font-semibold !text-base">
                {{ $t('task_submission') }} :
            </a-col>
            <a-col :span="24">
                <div class="flex h-auto gap-4 !mt-4 flex-wrap">
                    <div v-for="file in task.task_submissions" :key="file.storage_url">
                        <!-- Image: keep original style -->
                        <div v-if="isImage(file.storage_url)" class="relative w-[120px]">
                            <!-- Download Icon -->
                            <DownloadOutlined @click="downloadImage(file)"
                                class="absolute top-1 right-1 text-lg !text-green-800 !bg-grey-500 rounded-full shadow cursor-pointer z-10" />
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
                    </div>
                </div>
            </a-col>
        </a-row>
        <!-- task files -->
        <a-row>
            <a-col :span="24" class="!font-semibold !text-base">{{ $t('files_required_for_task') }}
                :</a-col>
        </a-row>
        <a-row>
            <a-col :span="24">
                <div class="flex h-auto gap-4 !mt-4 flex-wrap">
                    <div v-for="file in task.files" :key="file.storage_url">
                        <!-- Image: keep original style -->
                        <div v-if="isImage(file.storage_url)" class="relative w-[120px]">
                            <!-- Download Icon -->
                            <DownloadOutlined @click="downloadImage(file)"
                                class="absolute top-1 right-1 text-lg !text-green-800 !bg-grey-500 rounded-full shadow cursor-pointer z-10" />
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
                    </div>
                </div>
            </a-col>
        </a-row>

        <!-- sample image -->
        <a-row>
            <a-col :span="24" class="!font-semibold !text-base">{{ $t('sample_img') }} :</a-col>
        </a-row>
        <a-row>
            <a-col :span="24">
                <div class="relative !w-[120px]">
                    <!-- download Icon -->
                    <DownloadOutlined @click="downloadImage(task.sample_image)"
                        class="absolute top-1 right-1 text-lg !text-green-800 !bg-grey-500 rounded-full shadow cursor-pointer z-10" />
                    <!-- Image -->
                    <ImageView :image="task.sample_image" />
                </div>
            </a-col>
        </a-row>
        <!-- Model, Ambassador, and Other Characters files -->
        <a-row>
            <a-col :span="24" class="!font-semibold !text-base">{{ $t('actor_images') }} :</a-col>
        </a-row>
        <a-row>
            <a-col :span="24">
                <div class="flex h-auto gap-4 !mt-4 flex-wrap" v-if="task.actor_images.length > 0">
                    <template v-for="(img, i) in task.actor_images" :key="i">
                        <div class="relative">
                            <!-- Download Icon -->
                            <DownloadOutlined @click="downloadImage(img)"
                                class="absolute top-1 right-1 text-lg !text-green-800 !bg-grey-500 rounded-full shadow cursor-pointer z-10" />
                            <!-- Image -->
                            <ImageView v-if="img.storage_url" :image="img" class="!w-[120px]" />
                        </div>
                    </template>
                    <!-- <ImageList :image-list="task.actor_images" /> -->
                </div>
            </a-col>
        </a-row>
        <!-- Decorative files -->
        <a-row>
            <a-col :span="24" class="!font-semibold !text-base">{{ $t('decorative_image') }} :</a-col>
        </a-row>
        <a-row>
            <a-col :span="24">
                <div class="flex h-auto gap-4 !mt-4 flex-wrap">
                    <template v-for="(img, i) in task.decorative_images" :key="i">
                        <div class="relative">
                            <!-- Download Icon -->
                            <DownloadOutlined @click="downloadImage(img)"
                                class="absolute top-1 right-1 text-lg !text-green-800 !bg-grey-500 rounded-full shadow cursor-pointer z-10" />
                            <!-- Image -->
                            <ImageView v-if="img.storage_url" :image="img" class="!w-[120px]" />
                        </div>
                    </template>
                </div>
            </a-col>
        </a-row>

    </div>

    <AssignPopup :visible="showModal" :task-id="task.id" :user-list="userList" @close="showModal = false"
        @assigned="refetchDetail"></AssignPopup>
    <CompletePopup :visible="showCompleteModel" :task-id="task.id" @completed="refetchDetail"
        @close="showCompleteModel = false"></CompletePopup>
    <CancelPopup :visible="showCancelModel" :task-id="task.id" @close="showCancelModel = false"
        @cancelled="refetchDetail">
    </CancelPopup>
</template>
<script setup>
import { formatDate } from '@/utils/format';
import { useAuthStore } from '@/stores/auth';
import AssignPopup from '@/components/task/AssignPopup.vue';
import CompletePopup from '@/components/task/CompletePopup.vue';
import CancelPopup from '@/components/task/CancelPopup.vue';
import { onMounted, ref } from 'vue';
import api from '@/lib/axios';
import { getColor } from '@/utils/initials';
import ImageList from '../ui/ImageList.vue';
import ImageView from '../ui/ImageView.vue';
import { DownloadOutlined, EditOutlined } from '@ant-design/icons-vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
    task: {
        type: Object,
        required: true
    },
    userList: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['fetchDetail', 'clickEdit']);
const auth = useAuthStore();
const user = auth.user;
const userId = user.id;
const userRoleId = user.role_id;
const uiRoleId = import.meta.env.VITE_UI_ROLE_ID;
const hasEditPermission = ref(false);

const showModal = ref(false);
const showCompleteModel = ref(false);
const showCancelModel = ref(false);

const clickCompleteBtn = () => {
    showCompleteModel.value = true;
}

const downloadImage = async (img) => {
    try {
        const response = await fetch(img.storage_url, { mode: 'cors' }); // CORS must be allowed by Bunny
        const blob = await response.blob();

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', img.file_name || 'download.jpg');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up memory
        URL.revokeObjectURL(link.href);
    } catch (err) {
        console.error('Failed to download image:', err);
    }
};

const refetchDetail = (updatedTask) => {
    emit('fetchDetail');
    showModal.value = false;
    showCompleteModel.value = false;
    showCancelModel.value = false;
};

const clickCancelBtn = () => {
    showCancelModel.value = true
};

const updateTaskStatus = (status) => {
    api.post('/api/task/change-status', { status, task_id: props.task.id }).then(res => {
        emit('fetchDetail');
    })
}

const assignTask = () => {
    showModal.value = true;
};

const changeToArray = (data) => {
    return JSON.parse(data);
}

const changeToString = (data) => {
    return data.map(t => t.text).join(', ');
}

const isImage = (url) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url);
};

const isVideo = (url) => {
    return /\.(mp4|mov|webm|ogg|mkv)$/i.test(url);
};

onMounted(() => {
    hasEditPermission.value = auth.hasPermission('task_edit');
})

</script>