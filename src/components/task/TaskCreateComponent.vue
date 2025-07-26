<template>
    <h2 class="!font-bold text-3xl">หัวข้อหลัก/ Main topic</h2>
    <a-form :model="formState" name="create_task" layout="vertical" autocomplete="off" class="bg-white w-full">

        <!-- Job Title Section -->
        <a-row>
            <a-col :span="24">
                <a-form-item label="ชื่องาน/ Job Title" name="job_title"
                    :rules="[{ required: true, message: 'please input Job Title!' }]"
                    :validate-status="errors.job_title ? 'error' : ''" :help="errors.job_title">
                    <a-input v-model:value="formState.job_title" placeholder="Enter project name or task name..."
                        class="w-full" />
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Task Type Section -->
        <a-row :gutter="16">
            <a-col :span="formState.task_type === 'custom' ? 12 : 24">
                <a-form-item label="ประเภทของงาน/ Task Type" name="task_type"
                    :rules="[{ required: true, message: 'please select task type!' }]"
                    :validate-status="errors.task_type ? 'error' : ''" :help="errors.task_type">
                    <a-select v-model:value="formState.task_type" placeholder="Select Task type" class="w-full">
                        <a-select-option v-for="task in taskTypeList" :key="task.id" :value="task.id">
                            {{ task.name }}
                        </a-select-option>
                        <a-select-option value="custom">กำหนดเอง/Custom</a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>

            <!-- Custom Task Type Input -->
            <a-col v-if="formState.task_type === 'custom'" :span="12">
                <a-form-item label="Custom Task Type Name" name="custom_task_type"
                    :rules="[{ required: true, message: 'please input custom task type!' }]"
                    :validate-status="errors.custom_task_type ? 'error' : ''" :help="errors.custom_task_type">
                    <a-input v-model:value="formState.custom_task_type" placeholder="Enter new task type"
                        class="w-full" />
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Size Section -->
        <a-row :gutter="16">
            <a-col :span="formState.size === 'custom' ? 12 : 24">
                <a-form-item label="ขนาด/ Size" name="size"
                    :rules="[{ required: true, message: 'please select size!' }]"
                    :validate-status="errors.size ? 'error' : ''" :help="errors.size">
                    <a-select v-model:value="formState.size" :disabled="!formState.task_type"
                        :placeholder="!formState.task_type ? 'Please select Task Type first' : 'Select Size'"
                        class="w-full">
                        <!-- If task type is custom, only show custom option -->
                        <template v-if="formState.task_type === 'custom'">
                            <a-select-option value="custom">กำหนดเอง/Custom</a-select-option>
                        </template>

                        <!-- Otherwise show list from API -->
                        <template v-else>
                            <a-select-option v-for="size in sizeList" :key="size.id" :value="size.id">
                                {{ size.name }}
                            </a-select-option>
                            <a-select-option value="custom">กำหนดเอง/Custom</a-select-option>
                        </template>
                    </a-select>
                </a-form-item>
            </a-col>

            <!-- Custom Size Input -->
            <a-col v-if="formState.size === 'custom'" :span="12">
                <a-form-item label="Custom Size" name="custom_size"
                    :rules="[{ required: true, message: 'please input custom size!' }]"
                    :validate-status="errors.custom_size ? 'error' : ''" :help="errors.custom_size">
                    <a-input v-model:value="formState.custom_size" placeholder="Enter custom size" class="w-full" />
                </a-form-item>
            </a-col>
        </a-row>

        <!-- File Type Section -->
        <a-row>
            <a-col :span="24">
                <a-form-item label="ประเภทไฟล์ / File Types" name="file_types"
                    :rules="[{ required: true, message: 'Please select at least one file type' }]"
                    :validate-status="errors.file_types ? 'error' : ''" :help="errors.file_types">
                    <a-select mode="multiple" v-model:value="formState.file_types"
                        placeholder="Select up to 3 file types" :maxTagCount="3" :maxTagPlaceholder="() => '+ more'"
                        :disabled="fileTypeList.length === 0"
                        :options="fileTypeList.map(type => ({ label: type, value: type }))" class="w-full"
                        @change="handleFileTypeChange" />
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Color Selection -->
        <a-row :gutter="16">
            <!-- Dropdown -->
            <a-col :span="12">
                <a-form-item label="สี (เลือกได้สูงสุด 3 สี) / Colors (Optional)" name="colors">
                    <a-select mode="multiple" v-model:value="formState.colors" placeholder="Select up to 3 colors"
                        :maxTagCount="3" :maxTagPlaceholder="() => '+ more'" class="w-full" show-search :filter-option="(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())" @change="handleColorChange">
                        <a-select-option v-for="color in colorList" :key="color.color_code" :value="color.color_code">
                            <div class="flex items-center gap-2">
                                <span class="w-4 h-4 rounded-full border border-gray-300 inline-block"
                                    :style="{ backgroundColor: color.color_code }"></span>
                                <span>{{ color.th }} / {{ color.en }}</span>
                            </div>
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>

            <!-- Preview -->
            <a-col :span="12">
                <span>ตัวอย่างสี / Color Samples</span>
                <div class="flex h-14 gap-6 items-center pt-2">
                    <div v-for="code in formState.colors" :key="code" :style="{ backgroundColor: code }"
                        class=" size-14 rounded-lg shadow border border-gray-300" :title="code"></div>
                </div>
            </a-col>
        </a-row>

        <!-- Theme Selection -->
        <a-row :gutter="16">
            <!-- Dropdown -->
            <a-col :span="12">
                <a-form-item label="ธีม / Themes" name="themes"
                    :rules="[{ required: true, message: 'Please select at least one theme or enter a custom one' }]"
                    :validate-status="errors.themes ? 'error' : ''" :help="errors.themes">
                    <a-select mode="multiple" v-model:value="formState.themes" placeholder="Select up to 3 themes"
                        :maxTagCount="3" :maxTagPlaceholder="() => '+ more'" show-search :filter-option="(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())" :options="themeList.map(theme => ({
                                label: theme.text,
                                value: theme.id
                            }))" class="w-full" @change="handleThemeChange" />
                </a-form-item>
            </a-col>

            <!-- Preview / Placeholder -->
            <a-col :span="12">
                <span>preview of previous project</span>
                <div class="flex flex-wrap gap-2 pt-2 h-full">
                    <!-- Placeholder spacing for future preview -->
                    <div v-for="(file, index) in previewPreviousFiles" :key="index" class="w-28">
                        <a-image :src="file.storage_url" alt="Preview"
                            class="!size-25 object-fill !border !border-gray-200 rounded-lg" />
                        <div class="text-xs mt-1 truncate" :title="file.file_name">{{ file.file_name }}</div>
                    </div>
                    <!-- <div v-for="(theme, index) in allSelectedThemes" :key="index"
                        class="w-28 h-10 bg-gray-100 rounded border text-xs flex items-center justify-center text-center px-2">
                        {{ theme }}
                    </div> -->
                </div>
            </a-col>
        </a-row>

        <!-- Custom Theme Inputs (below dropdown) -->
        <a-row class="mt-2" v-if="formState.custom_themes.length < 3">
            <a-col :span="24">
                <div class="flex flex-col gap-2">
                    <div v-for="(val, index) in formState.custom_themes" :key="index" class="flex gap-2 items-center">
                        <a-input v-model:value="formState.custom_themes[index]" placeholder="Enter custom theme"
                            class="w-full" />
                        <a-button danger type="text" @click="removeCustomTheme(index)">Remove</a-button>
                    </div>
                    <a-button type="dashed" @click="addCustomTheme" :disabled="totalThemeCount >= 3">
                        + Add Custom Theme
                    </a-button>
                </div>
            </a-col>
        </a-row>

        <!-- Image Text -->
        <a-row>
            <a-col :span="24">
                <a-form-item label="ข้อความในรูป/ Image Text" name="image_text"
                    :rules="[{ required: true, message: 'Please input image text' }]"
                    :validate-status="errors.image_text ? 'error' : ''" :help="errors.image_text">
                    <a-textarea v-model:value="formState.image_text" placeholder="Enter image text" :rows="3" />
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Task Description -->
        <a-row>
            <a-col :span="24">
                <a-form-item label="ข้อความกำกับงาน/ Task Description" name="task_description"
                    :rules="[{ required: true, message: 'Please input task description' }]"
                    :validate-status="errors.task_description ? 'error' : ''" :help="errors.task_description">
                    <a-textarea v-model:value="formState.task_description" placeholder="Enter task description"
                        :rows="4" />
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Task File Upload -->
        <a-row>
            <a-col :span="24">
                <a-form-item label="Upload Task Files" name="task_file"
                    :rules="[{ required: true, message: 'Please upload at least one file' }]"
                    :validate-status="errors.task_file ? 'error' : ''" :help="errors.task_file">
                    <a-upload list-type="picture-card" multiple :file-list="formState.task_file"
                        :before-upload="() => false" accept="image/*,video/*" @change="handleFileUpload">
                        <div>
                            <plus-outlined />
                            <div style="margin-top: 8px">Upload</div>
                        </div>
                    </a-upload>
                </a-form-item>
            </a-col>
        </a-row>

        <!-- Sample Image Section -->
        <a-row :gutter="16">
            <a-col :span="16">
                <a-form-item label="ภาพตัวอย่าง/ Sample Image" name="sample_image"
                    :rules="[{ required: true, message: 'Please provide a sample image' }]"
                    :validate-status="errors.sample_image ? 'error' : ''" :help="errors.sample_image">
                    <div class="flex gap-4">
                        <a-button @click="openSampleModal">เลือกในระบบ/ Select from system</a-button>
                        <a-upload :before-upload="handleSampleUpload" :show-upload-list="false" accept="image/*">
                            <a-button>อัพโหลดรูปภาพเอง / Upload your own image</a-button>
                        </a-upload>
                    </div>

                    <!-- Image Preview -->

                </a-form-item>
            </a-col>
            <a-col :span="6">
                <span>Samples Image Preview</span>
                <div v-if="formState.sample_image" class="mt-4">
                    <ImageView v-if="formState.sample_image_type === 'system'" :image="formState.sample_image"
                        class="w-[120px]" />
                    <LocalImageView v-else-if="formState.sample_image"
                        :image-url="createObjectURL(formState.sample_image)" class="!w-[120px]" />
                </div>
            </a-col>
        </a-row>
        <!-- ACTOR IMAGE SECTION -->
        <a-row>
            <a-col :span="24">
                <a-form-item label="นางแบบ / แอดบาสเดอร์ / ตัวละครอื่นๆ / Actor Images">
                    <div class="flex gap-4">
                        <a-button @click="openActorModal">เลือกในระบบ / Select from system</a-button>
                        <a-upload multiple :before-upload="handleActorUpload" :show-upload-list="false"
                            accept="image/*">
                            <a-button>อัพโหลดรูปภาพเอง / Upload your own image</a-button>
                        </a-upload>
                    </div>
                </a-form-item>
            </a-col>
        </a-row>
        <a-row>
            <a-col :span="24">
                <!-- Preview -->
                <span>Actor Images previews</span>
                <div class="flex h-auto gap-4 !mt-4 flex-wrap">
                    <template v-for="(img, i) in formState.actor_images" :key="i">
                        <div class="relative">
                            <!-- Delete Icon -->
                            <MinusCircleOutlined
                                class="absolute -top-2 -right-2 !text-red-500 !bg-white  rounded-full shadow cursor-pointer z-10"
                                @click="removeActorImage(i)" />
                            <!-- Image -->
                            <ImageView v-if="img.storage_url" :image="img" class="!w-[120px]" />
                            <LocalImageView v-else :image-url="createObjectURL(img)" class="!w-[120px]" />
                        </div>
                    </template>
                </div>
            </a-col>
        </a-row>

        <!-- DECORATIVE IMAGE SECTION -->
        <a-row>
            <a-col :span="24">
                <a-form-item label="รูปตกแต่ง / Decorative Images">
                    <div class="flex gap-4">
                        <a-button @click="openDecorativeModal">เลือกในระบบ / Select from system</a-button>
                        <a-upload multiple :before-upload="handleDecorativeUpload" :show-upload-list="false"
                            accept="image/*">
                            <a-button>อัพโหลดรูปภาพเอง / Upload your own image</a-button>
                        </a-upload>
                    </div>
                </a-form-item>
            </a-col>
        </a-row>

        <a-row>
            <a-col :span="24">
                <!-- Preview -->
                <span>Decorative Images previews</span>
                <div class="flex h-auto gap-4 !mt-4 flex-wrap">
                    <template v-for="(img, i) in formState.decorative_images" :key="i">
                        <div class="relative">
                            <!-- Delete Icon -->
                            <MinusCircleOutlined
                                class="absolute -top-2 -right-2 !text-red-500 !bg-white  rounded-full shadow cursor-pointer z-10"
                                @click="removeDecorativeImage(i)" />
                            <!-- Image -->
                            <ImageView v-if="img.storage_url" :image="img" class="!w-[120px]" />
                            <LocalImageView v-else :image-url="createObjectURL(img)" class="!w-[120px]" />
                        </div>
                    </template>
                </div>
            </a-col>
        </a-row>

        <!-- Requester Name Section -->
        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="ชื่อผู้สั่งงาน / Requester Name" name="requester_name"
                    :rules="[{ required: true, message: 'please input Requester Name!' }]"
                    :validate-status="errors.requester_name ? 'error' : ''" :help="errors.requester_name">
                    <a-input v-model:value="formState.requester_name"
                        placeholder="Enter the name of the person ordering..." class="w-full" />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item label="กำหนดส่งงาน / Deadline" name="deadline"
                    :rules="[{ required: true, message: 'please select the date of deadline!' }]"
                    :validate-status="errors.deadline ? 'error' : ''" :help="errors.deadline">
                    <a-date-picker v-model:value="formState.deadline" class="w-full" />
                </a-form-item>
            </a-col>
        </a-row>


        <!-- Footer Buttons -->
        <div class="flex items-center justify-end gap-4 pt-4">
            <a-button @click="clickCancelBtn">Cancel</a-button>
            <a-button type="primary" :disabled="isLoading" @click="submitForm">Create</a-button>
        </div>
    </a-form>

    <a-modal v-model:visible="sampleModalVisible" title="Select Sample Image" @ok="confirmSystemImageSelection"
        @cancel="cancelSystemImageSelection" :ok-button-props="{ disabled: !selectedSystemImage }" ok-text="Select"
        cancel-text="Cancel" width="800px">
        <div class="h-[70vh] overflow-auto !mb-4">
            <div class="flex h-auto gap-4 !mt-4 flex-wrap">
                <div v-for="item in sampleImageList" :key="item.id" :class="[
                    'cursor-pointer border rounded overflow-hidden transition',
                    selectedSystemImage && selectedSystemImage.id === item.id
                        ? 'bg-blue-200'
                        : 'hover:bg-blue-100'
                ]" @click="selectSystemImage(item)">
                    <div class="relative w-40 h-40">
                        <!-- Delete Icon -->
                        <CheckCircleOutlined v-if="selectedSystemImage && selectedSystemImage.id === item.id"
                            class="absolute top-1 right-1 !text-green-500 bg-white rounded-full shadow-md z-10 text-xl" />
                        <!-- Image -->
                        <img :src="item.storage_url" alt="sample"
                            class="!w-40 !h-40 object-fill !border !border-gray-200 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex justify-end">
            <a-pagination :current="samplePage" :page-size="25" :total="sampleTotal" @change="handleSamplePageChange"
                show-less-items />
        </div>
    </a-modal>

    <!-- SYSTEM IMAGE PICKERS -->
    <SystemImagePicker v-model:visible="actorModalVisible" :image-list="actorImageList" :website-list="websiteList"
        :total="actorTotal" :current-page="actorPage" :selected="selectedActorIds" title="Select Actor Images"
        @update:selected="selectedActorIds = $event" @confirm="confirmActorSelection"
        @cancel="actorModalVisible = false" @page-change="loadActorPageWithPagination"
        @website-change="loadActorPageWithWebsite" />

    <SystemImagePicker v-model:visible="decorativeModalVisible" :image-list="decorativeImageList"
        :total="decorativeTotal" :current-page="decorativePage" :selected="selectedDecorativeIds"
        title="Select Decorative Images" @update:selected="selectedDecorativeIds = $event"
        @confirm="confirmDecorativeSelection" @cancel="decorativeModalVisible = false"
        @page-change="loadDecorativePageWithPagination" />

</template>
<script setup>
import api from '@/lib/axios';
import { computed, onMounted, ref, watch } from 'vue';
import { PlusOutlined, MinusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons-vue';
import SystemImagePicker from './SystemImagePicker.vue';
import { mergeSelectedImages } from '@/utils/mergeSelectedImage';
import router from '@/router';
import ImageView from '../ui/ImageView.vue';
import LocalImageView from '../ui/LocalImageView.vue';

const props = defineProps({
    websiteId: {
        type: Number,
        required: true
    },
    websiteList: {
        type: Array,
        required: true
    }
});

const formState = ref({
    website_id: props.websiteId,
    job_title: '', task_type: null, custom_task_type: '', size: null, custom_size: '', file_types: [], colors: [], themes: [], custom_themes: [], image_text: '',
    task_description: '',
    task_file: [],
    sample_image: null,
    sample_image_type: '',
    actor_images: [],
    decorative_images: [],
    requester_name: '',
    deadline: ''
});
const errors = ref({
    job_title: '', task_type: null, custom_task_type: '', size: null, custom_size: '', file_types: '', themes: '', image_text: '',
    task_description: '',
    task_file: '',
    sample_image: '',
    requester_name: '',
    deadline: ''
});

const isLoading = ref(false);
const taskTypeList = ref([]);
const sizeList = ref([]);
const fileTypeList = ref([]);
const colorList = ref([]);
const themeList = ref([]);
const sampleImageList = ref([]);
const decorativeImageList = ref([]);
const samplePage = ref(1);
const sampleTotal = ref(0);
const sampleModalVisible = ref(false);
const selectedSystemImage = ref(null);

// Actor image logic
const actorModalVisible = ref(false);
const actorImageList = ref([]);
const actorPage = ref(1);
const actorTotal = ref(0);
const selectedActorIds = ref([]);

// Decorative image logic
const decorativeModalVisible = ref(false);
const decorativePage = ref(1);
const decorativeTotal = ref(0);
const selectedDecorativeIds = ref([]);

const previewPreviousFiles = ref([]);

const handleFileTypeChange = (selected) => {
    if (selected.length > 3) {
        // limit to first 3 selections
        formState.value.file_types = selected.slice(0, 3);
        errors.value.file_types = 'You can select up to 3 file types only';
    } else {
        errors.value.file_types = '';
    }
};

const handleColorChange = (selected) => {
    if (selected.length > 3) {
        formState.value.colors = selected.slice(0, 3);
    }
};

const totalThemeCount = computed(() => {
    return formState.value.themes.length + formState.value.custom_themes.length;
});

const allSelectedThemes = computed(() => {
    const selectedLabels = themeList.value
        .filter(item => formState.value.themes.includes(item.id))
        .map(item => item.text);
    return [...selectedLabels, ...formState.value.custom_themes];
});

const handleThemeChange = async (selected) => {
    if (selected.length + formState.value.custom_themes.length > 3) {
        formState.value.themes = selected.slice(0, 3 - formState.value.custom_themes.length);
        errors.value.themes = 'You can select up to 3 themes (including custom)';
    } else {
        errors.value.themes = '';
    }

    if (selected.length === 0) {
        previewPreviousFiles.value = [];
        return;
    }

    try {
        const response = await api.post('/api/themes/previous-files', {
            theme_ids: selected
        });
        previewPreviousFiles.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch preview files:', error);
        previewPreviousFiles.value = [];
    }
};

const addCustomTheme = () => {
    if (totalThemeCount.value < 3) {
        formState.value.custom_themes.push('');
        errors.value.themes = '';
    }
};

const removeCustomTheme = (index) => {
    formState.value.custom_themes.splice(index, 1);
};

const handleFileUpload = (info) => {
    // Only keep images and limit total number if needed
    const fileList = info.fileList.filter(file => {
        return file.type.startsWith('image/') || file.type.startsWith('video/');
    });

    formState.value.task_file = fileList;

    if (fileList.length === 0) {
        errors.value.task_file = 'Please upload at least one image file or video';
    } else {
        errors.value.task_file = '';
    }
};

const handleSampleUpload = (file) => {
    formState.value.sample_image = file;
    formState.value.sample_image_type = 'upload';
    errors.value.sample_image = '';
    return false; // prevent auto upload
};

const openSampleModal = () => {
    getSampleImageList();
    samplePage.value = 1;
    selectedSystemImage.value = formState.value.sample_image_type === 'system'
        ? formState.value.sample_image
        : null;
    sampleModalVisible.value = true;
};

const handleSamplePageChange = (page) => {
    samplePage.value = page;
    getSampleImageList(page);
};

const selectSystemImage = (item) => {
    selectedSystemImage.value = item;
};

const createObjectURL = (file) => {
    return URL.createObjectURL(file);
}

const confirmSystemImageSelection = () => {
    if (selectedSystemImage.value) {
        formState.value.sample_image = selectedSystemImage.value;
        formState.value.sample_image_type = 'system';
        errors.value.sample_image = '';
        sampleModalVisible.value = false;
    }
};

const cancelSystemImageSelection = () => {
    selectedSystemImage.value = null;
    sampleModalVisible.value = false;
};

//actor image logic
const openActorModal = () => {
    loadActorPage(actorPage.value, '');
    actorModalVisible.value = true;
};

const confirmActorSelection = async () => {
    await mergeSelectedImages(
        selectedActorIds.value,
        actorImageList.value,
        formState.value.actor_images,
        fetchActorImagesByIds
    );
    actorModalVisible.value = false;
};

const handleActorUpload = (file) => {
    formState.value.actor_images.push(file);
    return false;
};

const removeActorImage = (index) => {
    formState.value.actor_images.splice(index, 1);
};

// Decorative image logic
const openDecorativeModal = () => {
    loadDecorativePage(decorativePage.value);
    decorativeModalVisible.value = true;
};

const confirmDecorativeSelection = async () => {
    await mergeSelectedImages(
        selectedDecorativeIds.value,
        decorativeImageList.value,
        formState.value.decorative_images,
        fetchDecorativeImagesByIds
    );
    decorativeModalVisible.value = false;
    decorativeModalVisible.value = false;
};

const handleDecorativeUpload = (file) => {
    formState.value.decorative_images.push(file);
    return false;
};

const removeDecorativeImage = (index) => {
    formState.value.decorative_images.splice(index, 1);
};

const submitForm = async () => {
    if (!validateForm()) return;

    // 👉 Form is valid — proceed with API call or form submission
    console.log('Ready to submit:', formState.value);
    const formData = new FormData();

    // Scalars
    formData.append('website_id', String(formState.value.website_id));
    formData.append('job_title', formState.value.job_title);
    formData.append('task_type', String(formState.value.task_type));
    formData.append('custom_task_type', formState.value.custom_task_type || '');
    formData.append('size', String(formState.value.size));
    formData.append('custom_size', formState.value.custom_size || '');
    formData.append('image_text', formState.value.image_text);
    formData.append('task_description', formState.value.task_description);
    formData.append('requester_name', formState.value.requester_name);
    formData.append('deadline', formState.value.deadline);
    formData.append('sample_image_type', formState.value.sample_image_type);

    // 🖼 Sample image
    if (formState.value.sample_image_type === 'upload') {
        formData.append('sample_image', formState.value.sample_image);
    } else if (formState.value.sample_image_type === 'system') {
        formData.append('sample_image', String(formState.value.sample_image.id));
    }

    // 🧾 File types (array of strings)
    formState.value.file_types.forEach((type) => {
        formData.append('file_types[]', type);
    });

    // 🎨 Colors (array of hex values)
    formState.value.colors.forEach((color) => {
        formData.append('colors[]', color);
    });

    // 🎭 Themes (existing)
    formState.value.themes.forEach((themeId) => {
        formData.append('themes[]', String(themeId));
    });

    // 🧠 Custom themes
    formState.value.custom_themes.forEach((text) => {
        formData.append('custom_themes[]', text);
    });

    // 📂 Task files (Upload file list -> extract File object)
    formState.value.task_file.forEach((fileObj) => {
        const actualFile = fileObj.originFileObj;
        formData.append('task_file[]', actualFile);
    });

    // 👤 Actor images (mixed id or file)
    formState.value.actor_images.forEach((img) => {
        if (img.id) {
            formData.append('actor_images[]', String(img.id));
        } else {
            const actualFile = img.originFileObj || img;
            formData.append('actor_images[]', actualFile);
        }
    });

    // 🖼 Decorative images (mixed id or file)
    formState.value.decorative_images.forEach((img) => {
        if (img.id) {
            formData.append('decorative_images[]', String(img.id));
        } else {
            const actualFile = img.originFileObj || img;
            formData.append('decorative_images[]', actualFile);
        }
    });

    // TODO: Call API here
    isLoading.value = true;
    try {
        const res = await api.post('/api/task/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        router.push('/dashboard');
        console.log(res);
    } catch (err) {
        console.log(err);
    } finally {
        isLoading.value = false
    }
};

const clickCancelBtn = () => {
    router.push('/dashboard');
}

const loadActorPageWithWebsite = (siteId) => {
    loadActorPage(1, siteId);
}

const loadActorPageWithPagination = ({ page, site }) => {
    loadActorPage(page, site);
}

const loadDecorativePageWithPagination = ({ page, site }) => {
    loadDecorativePage(page);
}

const getTaskTypeList = () => {
    api.get('/api/get-task-type-name-list').then(res => {
        console.log(res);
        taskTypeList.value = res.data.data;
    });
}

const getSizesByTaskType = (taskTypeId) => {
    api.get(`/api/get-sizes-by-task-type/${taskTypeId}`).then(res => {
        sizeList.value = res.data.data;
    });
}

const getFileTypeList = () => {
    api.get('/api/get-file-type-list').then(res => {
        fileTypeList.value = res.data.data;
    });
}

const getColorList = () => {
    api.get('/api/get-color-list').then(res => {
        colorList.value = res.data.data;
    });
}

const getThemeNameList = () => {
    api.get('/api/get-theme-name-list').then(res => {
        themeList.value = res.data.data;
    });
}

const getSampleImageList = (page = 1) => {
    api.get(`/api/get-sample-image-list?page=${page}`).then(res => {
        sampleImageList.value = res.data.data.data;
        sampleTotal.value = res.data.data.total;
    });
};

const loadActorPage = (page, site) => {
    actorPage.value = page;
    api.get(`/api/get-actor-image-list?page=${page}&website=${site}`).then(res => {
        actorImageList.value = res.data.data.data;
        actorTotal.value = res.data.data.total;
    });
};

const loadDecorativePage = (page) => {
    decorativePage.value = page;
    api.get(`/api/get-decorative-image-list?page=${page}`).then(res => {
        decorativeImageList.value = res.data.data.data;
        decorativeTotal.value = res.data.data.total;
    });
};

const fetchActorImagesByIds = async (ids) => {
    const res = await api.get('/api/get-actor-image-by-ids', {
        params: { ids }
    });
    return res.data.data;
};

const fetchDecorativeImagesByIds = async (ids) => {
    const res = await api.get('/api/get-decorative-image-by-ids', {
        params: { ids }
    });
    return res.data.data;
};

watch(() => formState.value.task_type, (newVal) => {
    formState.value.size = null; // reset size selection

    if (newVal === 'custom') {
        sizeList.value = []; // clear size list
    } else if (newVal) {
        getSizesByTaskType(newVal); // fetch size list from API
    }
});

onMounted(() => {
    getTaskTypeList()
    getFileTypeList()
    getColorList()
    getThemeNameList()
})

const validateForm = () => {
    let hasError = false;

    // Reset all errors
    Object.keys(errors.value).forEach((key) => {
        errors.value[key] = '';
    });

    // Job Title
    if (!formState.value.job_title?.trim()) {
        errors.value.job_title = 'Please input Job Title! / กรุณากรอกชื่อตำแหน่งงาน';
        hasError = true;
    }

    // Task Type
    if (!formState.value.task_type) {
        errors.value.task_type = 'Please select task type! / กรุณาเลือกประเภทงาน';
        hasError = true;
    } else if (formState.value.task_type === 'custom' && !formState.value.custom_task_type?.trim()) {
        errors.value.custom_task_type = 'Please input custom task type! / กรุณากรอกประเภทงานที่กำหนดเอง';
        hasError = true;
    }

    // Size
    if (!formState.value.size) {
        errors.value.size = 'Please select size! / กรุณาเลือกขนาด';
        hasError = true;
    } else if (formState.value.size === 'custom' && !formState.value.custom_size?.trim()) {
        errors.value.custom_size = 'Please input custom size! / กรุณากรอกขนาดที่กำหนดเอง';
        hasError = true;
    }

    // File Types
    if (!formState.value.file_types.length) {
        errors.value.file_types = 'Please select at least one file type! / กรุณาเลือกประเภทไฟล์อย่างน้อยหนึ่งประเภท';
        hasError = true;
    }

    // Themes
    const totalThemes = formState.value.themes.length + formState.value.custom_themes.length;
    if (totalThemes === 0) {
        errors.value.themes = 'Please select at least one theme or enter a custom one! / กรุณาเลือกธีมหรือกรอกธีมที่กำหนดเองอย่างน้อยหนึ่งรายการ';
        hasError = true;
    }

    // Image Text
    if (!formState.value.image_text?.trim()) {
        errors.value.image_text = 'Please input image text! / กรุณากรอกข้อความภาพ';
        hasError = true;
    }

    // Task Description
    if (!formState.value.task_description?.trim()) {
        errors.value.task_description = 'Please input task description! / กรุณากรอกรายละเอียดงาน';
        hasError = true;
    }

    // Task File
    if (!formState.value.task_file.length) {
        errors.value.task_file = 'Please upload at least one file! / กรุณาอัปโหลดไฟล์อย่างน้อยหนึ่งไฟล์';
        hasError = true;
    }

    // Sample Image
    if (!formState.value.sample_image) {
        errors.value.sample_image = 'Please provide a sample image! / กรุณาแนบภาพตัวอย่าง';
        hasError = true;
    }

    // Requester Name
    if (!formState.value.requester_name?.trim()) {
        errors.value.requester_name = 'Please input Requester Name! / กรุณากรอกชื่อผู้ร้องขอ';
        hasError = true;
    }

    // Deadline
    if (!formState.value.deadline) {
        errors.value.deadline = 'Please select the date of deadline! / กรุณาเลือกวันกำหนดส่งงาน';
        hasError = true;
    }

    return !hasError;
};

</script>
