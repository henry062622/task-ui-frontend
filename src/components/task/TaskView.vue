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

                    <a-button
                        v-if="(task.status === 'in-progress' || task.status === 'needs-revision') && task.assignee?.id == userId"
                        @click="clickSubmitReview(task.id)">
                        {{ $t('submit_for_review') }}
                    </a-button>

                    <a-button v-if="task.status === 'waiting-for-review' && hasReviewPermission"
                        @click="clickMarkReview(task.id)">
                        {{ $t('reviewed') }}
                    </a-button>

                    <!-- <a-button v-if="task.status == 'in-progress' && task.assignee?.id == userId"
                        @click="clickCompleteBtn()">
                        {{ $t('complete') }}
                    </a-button> -->

                    <a-button
                        v-if="(task.status == 'in-progress' || task.status == 'pending') && task.assignee?.id == userId"
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
                        <a-tag :color="getColor(task.status)"> {{ getStatusLabel(task.status, userRoleId, uiRoleId)
                            }}</a-tag>
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
        <a-row :gutter="16">
            <a-col :span="12" v-if="task.task_submissions.length > 0">
                <a-row>
                    <a-col :span="24" class="!font-semibold !text-base">{{ $t('task_submission') }} :</a-col>
                    <a-col :span="24">
                        <div class="flex h-auto gap-4 !mt-4 flex-wrap w-full">
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

                                <!-- ZIP/RAR: show icon, filename, and download -->
                                <div v-else-if="isArchive(file.storage_url)"
                                    class="relative w-[120px] aspect-[4/5] flex flex-col gap-4 items-center justify-center border border-gray-200 rounded-lg bg-gray-100 py-4 px-2">
                                    <a :href="file.storage_url" class="absolute top-1 right-1 hover:!bg-gray-100">
                                        <DownloadOutlined
                                            class=" text-lg !text-green-800 !bg-grey-500 rounded-full shadow cursor-pointer z-10"
                                            :title="$t('download')" />
                                    </a>
                                    <div>
                                        <file-zip-outlined class="text-4xl mb-2" />
                                    </div>
                                    <div class="text-xs text-gray-700 text-center truncate w-[90px]">
                                        {{ file.file_name || 'Archive' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12" v-if="task.task_revision && task.status != 'complete'">
                <a-row>
                    <a-col :span="24" class="!font-semibold !text-base !mb-2">
                        {{ $t('revision_reason') }} :
                    </a-col>
                    <a-col :span="24">
                        <div class="flex gap-2">
                            <div class="relative w-[120px]">
                                <!-- Download Icon -->
                                <DownloadOutlined @click="downloadImage(task.task_revision)"
                                    class="absolute top-1 right-1 text-lg !text-green-800 !bg-grey-500 rounded-full shadow cursor-pointer z-10" />
                                <!-- Image -->
                                <a-image :src="task.task_revision.storage_url" alt="Preview"
                                    class="aspect-[4/5] !object-fill !border !border-gray-200 rounded-lg" />
                            </div>

                            <a-textarea :value="task.task_revision.reason" class="w-full" readonly></a-textarea>
                        </div>
                    </a-col>
                </a-row>
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

                        <!-- ZIP/RAR: show icon, filename, and download -->
                        <div v-else-if="isArchive(file.storage_url)"
                            class="relative w-[120px] aspect-[4/5] flex flex-col gap-4 items-center justify-center border border-gray-200 rounded-lg bg-gray-100 py-4 px-2">
                            <a :href="file.storage_url" class="absolute top-1 right-1 hover:!bg-gray-100">
                                <DownloadOutlined
                                    class=" text-lg !text-green-800 !bg-grey-500 rounded-full shadow cursor-pointer z-10"
                                    :title="$t('download')" />
                            </a>
                            <div>
                                <file-zip-outlined class="text-4xl mb-2" />
                            </div>
                            <div class="text-xs text-gray-700 text-center truncate w-[90px]">
                                {{ file.file_name || 'Archive' }}
                            </div>
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
                <div class="flex h-auto gap-4 !mt-4 flex-wrap" v-if="task.sample_images.length > 0">
                    <template v-for="(img, i) in task.sample_images" :key="i">
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
    <SubmitTaskForReview :visible="showSubmitTaskModel" :task-id="task.id" :task="task" @submitTask="refetchDetail"
        @close="showSubmitTaskModel = false"></SubmitTaskForReview>
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
import ImageView from '../ui/ImageView.vue';
import { DownloadOutlined, EditOutlined, FileZipOutlined } from '@ant-design/icons-vue';
import { Icon } from '@iconify/vue';
import SubmitTaskForReview from '@/components/task/SubmitTaskForReview.vue';
import { getStatusLabel } from '@/utils/status';

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
const showSubmitTaskModel = ref(false);
const showMarkReviewTaskModel = ref(false);
const hasReviewPermission = ref(false);

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
        let filename = img.file_name;

        // If no file_name, try to extract from storage_url
        if (!filename) {
            const urlParts = img.storage_url.split('/');
            filename = urlParts[urlParts.length - 1] || 'download';
        }
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
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

const clickSubmitReview = () => {
    showSubmitTaskModel.value = true;
}

const clickMarkReview = () => {
    showCompleteModel.value = true;
}

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

const isArchive = (url) => {
    return /\.(zip|rar)$/i.test(url);
};

onMounted(() => {
    hasEditPermission.value = auth.hasPermission('task_edit');
    hasReviewPermission.value = auth.hasPermission('task_review');
})

</script>