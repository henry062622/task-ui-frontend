<template>
  <h2 class="!font-bold text-3xl">{{ $t('main_topic') }}</h2>
  <a-form :model="formState" name="create_task" layout="vertical" autocomplete="off" class="bg-white w-full">

    <!-- Job Title Section -->
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item :label="$t('job_title')" name="job_title"
          :rules="[{ required: true, message: 'please input Job Title!' }]"
          :validate-status="errors.job_title ? 'error' : ''" :help="errors.job_title">
          <a-input v-model:value="formState.job_title" :placeholder="$t('enterProjectOrTask')" class="w-full" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item :label="$t('status')" name="status">
          <a-input :value="task.status" readonly class="w-full" />
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Task Type Section -->
    <a-row :gutter="16">
      <a-col :span="formState.task_type === 'custom' ? 12 : 24">
        <a-form-item :label="$t('task_type')" name="task_type"
          :rules="[{ required: true, message: 'please select task type!' }]"
          :validate-status="errors.task_type ? 'error' : ''" :help="errors.task_type">
          <a-select v-model:value="formState.task_type" :placeholder="$t('selectTaskType')" class="w-full">
            <a-select-option value="custom">{{ $t('custom') }}</a-select-option>
            <a-select-option v-for="task in taskTypeList" :key="task.id" :value="task.id">
              {{ task.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>

      <!-- Custom Task Type Input -->
      <a-col v-if="formState.task_type === 'custom'" :span="12">
        <a-form-item :label="$t('custom_task_type')" name="custom_task_type"
          :rules="[{ required: true, message: 'please input custom task type!' }]"
          :validate-status="errors.custom_task_type ? 'error' : ''" :help="errors.custom_task_type">
          <a-input v-model:value="formState.custom_task_type" :placeholder="t('enterNewTaskType')" class="w-full" />
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Size Section -->
    <a-row :gutter="16">
      <!-- Dropdown -->
      <a-col :span="12">
        <a-form-item :label="$t('size')" name="sizes"
          :rules="[{ required: true, message: t('validation.sizeRequired') }]"
          :validate-status="errors.size ? 'error' : ''" :help="errors.size || t('selectUpTo5Sizes')">
          <a-select mode="multiple" v-model:value="formState.sizes"
            :disabled="!formState.task_type || formState.task_type === 'custom'" :placeholder="!formState.task_type
              ? t('pleaseSelectTaskTypeFirst')
              : (formState.task_type === 'custom'
                ? t('noPredefinedSizesAddCustom')
                : t('selectUpTo5Sizes'))" :maxTagCount="5" :maxTagPlaceholder="() => '+ more'" class="w-full"
            @change="handleSizeChange" show-search
            :filter-option="(input, option) => option?.label?.toLowerCase?.().includes(input.toLowerCase())"
            :options="sizeList.map(s => ({ label: s.name, value: s.id }))" />
        </a-form-item>
      </a-col>

      <!-- Custom Size Inputs (like themes) -->
      <a-col :span="12">
        <a-form-item :label="$t('custom_size')" name="custom_sizes" :validate-status="errors.custom_size ? 'error' : ''"
          :help="errors.custom_size">
          <div class="flex flex-col gap-3">
            <div v-for="(val, index) in formState.custom_sizes" :key="index" class="flex gap-2 items-center">
              <a-input v-model:value="formState.custom_sizes[index]" placeholder="เช่น: 1080x1080" class="w-full" />
              <MinusCircleOutlined class="!text-red-500 text-xl rounded-full shadow cursor-pointer"
                @click="removeCustomSize(index)" />
            </div>
            <a-button type="dashed" @click="addCustomSize" :disabled="totalSizeCount >= 5">
              + {{ $t('add_custom_size') }}
            </a-button>
            <div class="text-xs text-gray-500">
              {{ t('remainingCount') }} {{ 5 - totalSizeCount }}
            </div>
          </div>
        </a-form-item>
      </a-col>
    </a-row>

    <!-- File Type Section -->
    <a-row>
      <a-col :span="24">
        <a-form-item :label="$t('file_types')" name="file_types"
          :rules="[{ required: true, message: 'Please select at least one file type' }]"
          :validate-status="errors.file_types ? 'error' : ''" :help="errors.file_types">
          <a-select mode="multiple" v-model:value="formState.file_types" :placeholder="t('selectUpTo3FileTypes')"
            :maxTagCount="3" :maxTagPlaceholder="() => '+ more'" :disabled="fileTypeList.length === 0"
            :options="fileTypeList.map(type => ({ label: type, value: type }))" class="w-full"
            @change="handleFileTypeChange" />
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Color Selection -->
    <a-row :gutter="16">
      <!-- Dropdown -->
      <a-col :span="12">
        <a-form-item :label="$t('colors_optional')" name="colors">
          <a-select mode="multiple" v-model:value="formState.colors" :placeholder="t('selectUpTo3Colors')"
            :maxTagCount="3" :maxTagPlaceholder="() => '+ more'" class="w-full" show-search :filter-option="(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())" @change="handleColorChange">
            <a-select-option v-for="color in colorList" :key="color.color_code" :value="color.color_code"
              :label="`${color.th} / ${color.en}`">
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
        <span>{{ $t('color_samples') }}</span>
        <div class="flex h-14 gap-6 items-center pt-2">
          <div v-for="code in formState.colors" :key="code" :style="{ backgroundColor: code }"
            class=" size-14 rounded-lg shadow border border-gray-300" :title="code"></div>
        </div>
      </a-col>
    </a-row>

    <!-- Theme Selection -->
    <!-- <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item :label="$t('themes')" name="themes">
          <a-select mode="multiple" v-model:value="formState.themes" :placeholder="t('selectUpTo3Themes')"
            :maxTagCount="3" :maxTagPlaceholder="() => '+ more'" show-search :filter-option="(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())" :options="themeList.map(theme => ({
                label: theme.text,
                value: theme.id
              }))" class="w-full" @change="handleThemeChange" />
        </a-form-item>
      </a-col>

      <a-col :span="12">
        <span>{{ $t('preview_of_previous_pj') }}</span>
        <div class="flex flex-wrap gap-2 pt-2 h-full">
          <div v-for="(file, index) in previewPreviousFiles" :key="index" class="w-28">
            <a-image :src="file.storage_url" alt="Preview"
              class="!size-25 object-fill !border !border-gray-200 rounded-lg" />
            <div class="text-xs mt-1 truncate" :title="file.file_name">{{ file.file_name }}</div>
          </div>
        </div>
      </a-col>
    </a-row> -->

    <!-- Custom Theme Inputs (below dropdown) -->
    <!-- <a-row class="mt-2" v-if="formState.custom_themes.length < 3">
      <a-col :span="24">
        <div class="flex flex-col gap-2">
          <div v-for="(val, index) in formState.custom_themes" :key="index" class="flex gap-2 items-center">
            <a-input v-model:value="formState.custom_themes[index]" :placeholder="t('enterCustomTheme')"
              class="w-full" />
            <a-button danger type="text" @click="removeCustomTheme(index)">Remove</a-button>
          </div>
          <a-button type="dashed" @click="addCustomTheme" :disabled="totalThemeCount >= 3">
            + {{ $t('add_custom_theme') }}
          </a-button>
        </div>
      </a-col>
    </a-row> -->

    <!-- Image Text -->
    <a-row class="!mt-10">
      <a-col :span="24">
        <a-form-item :label="$t('image_text')" name="image_text"
          :rules="[{ required: true, message: 'Please input image text' }]"
          :validate-status="errors.image_text ? 'error' : ''" :help="errors.image_text">
          <a-textarea v-model:value="formState.image_text" :placeholder="t('enterImageText')" :rows="3" />
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Task Description -->
    <a-row>
      <a-col :span="24">
        <a-form-item :label="$t('task_description')" name="task_description"
          :rules="[{ required: true, message: 'Please input task description' }]"
          :validate-status="errors.task_description ? 'error' : ''" :help="errors.task_description">
          <a-textarea v-model:value="formState.task_description" :placeholder="t('enterTaskDescription')" :rows="4" />
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Task File Upload -->
    <a-row>
      <a-col :span="24">
        <a-form-item :label="$t('files_required_for_task')" name="task_file">
          <FileUploader v-model="formState.task_file" />
          <!-- <a-upload list-type="picture-card" multiple :file-list="formState.task_file"
                        :before-upload="() => false" @change="handleFileUpload">
                        <div>
                            <plus-outlined />
                            <div style="margin-top: 8px">{{ $t('upload') }}</div>
                        </div>
                    </a-upload> -->
        </a-form-item>
      </a-col>
    </a-row>

    <!-- Sample Images Section -->
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item :label="`${$t('sample_img')} (${$t('select_upload_max_3_imgs')})`" name="sample_images"
          :rules="[{ required: true, message: 'Please provide sample images' }]"
          :validate-status="errors.sample_image ? 'error' : ''" :help="errors.sample_image">
          <div class="flex gap-4">
            <a-button @click="openSampleModal" :disabled="formState.sample_images.length >= 3">
              {{ $t('select_from_system') }}
            </a-button>
            <a-upload multiple :before-upload="handleSampleUpload" :show-upload-list="false" accept="image/*"
              :disabled="formState.sample_images.length >= 3">
              <a-button>{{ $t('upload_your_own_img') }}</a-button>
            </a-upload>
          </div>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <!-- Preview -->
        <span>{{ $t('samples_img_preview') }}</span>
        <div class="flex h-auto gap-4 !mt-4 flex-wrap">
          <template v-for="(img, i) in formState.sample_images" :key="i">
            <div class="relative">
              <!-- Delete Icon -->
              <MinusCircleOutlined
                class="absolute -top-2 -right-2 !text-red-500 !bg-white  rounded-full shadow cursor-pointer z-10"
                @click="removeSampleImage(i)" />
              <!-- Image -->
              <ImageView v-if="img.storage_url" :image="img" class="!w-[120px]" />
              <LocalImageView v-else :image-url="createObjectURL(img)" class="!w-[120px]" />
            </div>
          </template>
        </div>
      </a-col>
    </a-row>
    <!-- ACTOR IMAGE SECTION -->
    <a-row>
      <a-col :span="24">
        <a-form-item :label="$t('actor_images')">
          <div class="flex gap-4">
            <a-button @click="openActorModal">{{ $t('select_from_system') }}</a-button>
            <a-upload multiple :before-upload="handleActorUpload" :show-upload-list="false" accept="image/*">
              <a-button>{{ $t('upload_your_own_img') }}</a-button>
            </a-upload>
          </div>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <!-- Preview -->
        <span>{{ $t('actor_image_preview') }}</span>
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
        <a-form-item :label="$t('decorative_image')">
          <div class="flex gap-4">
            <a-button @click="openDecorativeModal">{{ $t('select_from_system') }}</a-button>
            <a-upload multiple :before-upload="handleDecorativeUpload" :show-upload-list="false" accept="image/*">
              <a-button>{{ $t('upload_your_own_img') }}</a-button>
            </a-upload>
          </div>
        </a-form-item>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="24">
        <!-- Preview -->
        <span>{{ $t('decorative_images_preview') }}</span>
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
        <a-form-item :label="$t('requester_name')" name="requester_name"
          :rules="[{ required: true, message: 'please input Requester Name!' }]"
          :validate-status="errors.requester_name ? 'error' : ''" :help="errors.requester_name">
          <a-input v-model:value="formState.requester_name" :placeholder="t('enterRequesterNameFull')" class="w-full" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item :label="$t('deadline')" name="deadline"
          :rules="[{ required: true, message: 'please select the date of deadline!' }]"
          :validate-status="errors.deadline ? 'error' : ''" :help="errors.deadline">
          <a-date-picker v-model:value="formState.deadline" class="w-full" :placeholder="$t('selectDate')" />
        </a-form-item>
      </a-col>
    </a-row>

    <!-- assignee -->
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item :label="$t('assignee')" name="assignee">
          <a-select v-model:value="formState.assignee" :placeholder="$t('assignee')" allow-clear style="width: 100%">
            <a-select-option v-for="user in userList" :key="user.id" :value="user.id"> {{ user.name
            }} </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>


    <!-- Footer Buttons -->
    <div class="flex items-center justify-end gap-4 pt-4">
      <a-button @click="emit('clickCancelBtn')">{{ $t('cancel') }}</a-button>
      <a-button type="primary" :disabled="isLoading" :loading="isLoading" @click="submitForm">{{ $t('update')
      }}</a-button>
    </div>
  </a-form>

  <a-modal v-model:open="sampleModalVisible" :title="$t('select_sample_img')" @ok="confirmSystemImageSelection"
    @cancel="cancelSystemImageSelection" :ok-button-props="{ disabled: selectedSystemImages.length == 0 }"
    :ok-text="$t('select')" :cancel-text="$t('cancel')" width="800px">
    <div class="h-[70vh] overflow-auto !mb-4">
      <div class="flex h-auto gap-4 !mt-4 flex-wrap">
        <div v-for="item in sampleImageList" :key="item.id" :class="[
          'cursor-pointer border border-gray-200 rounded-lg overflow-hidden transition',
          selectedSystemImages.some(img => img.id === item.id)
            ? 'bg-blue-200'
            : selectedSystemImages.length >= 3
              ? 'opacity-50 pointer-events-none'
              : 'hover:bg-blue-100'
        ]" @click="toggleSystemImage(item)">
          <div class="relative !w-30 group">
            <CheckCircleOutlined v-if="selectedSystemImages.some(img => img.id === item.id)"
              class="absolute top-1 right-1 !text-green-500 bg-white rounded-full shadow-md z-10 text-xl" />
            <img :src="item.thumbnail_url" alt="sample" class="!w-30 aspect-[4/5] object-fill" />
            <!-- View icon overlay -->
            <EyeOutlined
              class="absolute bottom-1 right-1 cursor-pointer bg-gray-300 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              @click.stop="previewRef.openPreview(item.storage_url)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex justify-end">
      <a-pagination :current="samplePage" :page-size="25" :total="sampleTotal" @change="handleSamplePageChange"
        show-less-items show-quick-jumper :showSizeChanger="false" />
    </div>
  </a-modal>

  <!-- SYSTEM IMAGE PICKERS -->
  <SystemImagePicker v-model:visible="actorModalVisible" :website-list="websiteList" :image-list="actorImageList"
    :total="actorTotal" :current-page="actorPage" :selected="selectedActorIds" title="Select Actor Images"
    @update:selected="selectedActorIds = $event" @confirm="confirmActorSelection" @cancel="actorModalVisible = false"
    @page-change="loadActorPageWithPagination" @website-change="loadActorPageWithWebsite" />

  <SystemImagePicker v-model:visible="decorativeModalVisible" :image-list="decorativeImageList"
    :decorative-types="decorativeTypeList" :total="decorativeTotal" :current-page="decorativePage"
    :selected="selectedDecorativeIds" title="Select Decorative Images" @update:selected="selectedDecorativeIds = $event"
    @confirm="confirmDecorativeSelection" @cancel="decorativeModalVisible = false"
    @page-change="loadDecorativePageWithPagination" @decorative-type-change="loadDecorativePageWithType" />

  <!-- & at the very bottom: -->
  <PasteImageModal v-model="pasteModalVisible" :options="pasteTargetOptions" @confirm="onPasteConfirm" />

  <!-- show preview for sample -->
  <CustomPreviewImage ref="previewRef" />

</template>
<script setup>
import api from '@/lib/axios';
import { computed, onMounted, ref, watch } from 'vue';
import { PlusOutlined, MinusCircleOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons-vue';
import SystemImagePicker from './SystemImagePicker.vue';
import { mergeSelectedImages } from '@/utils/mergeSelectedImage';
import dayjs from 'dayjs';
import ImageView from '../ui/ImageView.vue';
import LocalImageView from '../ui/LocalImageView.vue';
import { useI18n } from 'vue-i18n'
import PasteImageModal from './PasteImageModal.vue';
import CustomPreviewImage from '../ui/CustomPreviewImage.vue';
import FileUploader from '../general/FileUploader.vue';

const { t } = useI18n()

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  userList: {
    type: Array,
    required: true
  },
  websiteId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['clickCancelBtn', 'successUpdate']);

const formState = ref({
  website_id: props.websiteId,
  job_title: '', task_type: props.task.task_type_id, custom_task_type: '', sizes: [], custom_sizes: [], file_types: [], colors: [], themes: [], custom_themes: [], image_text: '',
  task_description: '',
  task_file: [],
  sample_images: [],
  actor_images: [],
  decorative_images: [],
  requester_name: '',
  deadline: '',
  assignee: ''
});
const errors = ref({
  job_title: '', task_type: null, custom_task_type: '', size: null, custom_size: '', file_types: '', colors: '', themes: '', image_text: '',
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
const selectedSystemImages = ref([]);
const decorativeTypeList = ref([]);

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
const websiteList = ref([]);

// Paste preview popup
const pasteModalVisible = ref(false)
const pasteTargetOptions = [
  { label: t('files_required_for_task'), value: 'task_file' },
  { label: t('sample_img'), value: 'sample_image' },
  { label: t('actor_images'), value: 'actor_images' },
  { label: t('decorative_image'), value: 'decorative_images' },
]

//sample image preview
const previewRef = ref(null)

function onPasteConfirm({ file, target }) {
  switch (target) {
    case 'task_file':
      formState.value.task_file.push({
        uid: Date.now().toString(),
        name: file.name,
        status: 'done',
        originFileObj: file,
      })
      errors.value.task_file = ''
      break

    case 'sample_image':
      formState.value.sample_images.push(file)
      errors.value.sample_image = ''
      break

    case 'actor_images':
      formState.value.actor_images.push(file)
      break

    case 'decorative_images':
      formState.value.decorative_images.push(file)
      break
  }
}

const handleFileTypeChange = (selected) => {
  if (selected.length > 3) {
    // limit to first 3 selections
    formState.value.file_types = selected.slice(0, 3);
    errors.value.file_types = 'You can select up to 3 file types only';
  } else {
    errors.value.file_types = '';
  }
};

const totalSizeCount = computed(() =>
  (formState.value.sizes?.length || 0) + (formState.value.custom_sizes?.length || 0)
);

const handleSizeChange = (selected) => {
  const allowed = 5 - formState.value.custom_sizes.length;
  if (selected.length > allowed) {
    formState.value.sizes = selected.slice(0, allowed);
    errors.value.size = t('validation.maxSizes', { max: 5 });
  } else {
    errors.value.size = '';
  }
};

const addCustomSize = () => {
  if (totalSizeCount.value < 5) {
    formState.value.custom_sizes.push('');
    errors.value.size = '';
  }
};

const removeCustomSize = (index) => {
  formState.value.custom_sizes.splice(index, 1);
  errors.value.size = '';
};

const handleColorChange = (selected) => {
  if (selected.length > 3) {
    formState.value.colors = selected.slice(0, 3);
  }
};

const totalThemeCount = computed(() => {
  return formState.value.themes.length + formState.value.custom_themes.length;
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
    if (file.type) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) return true;
      if (file.type === 'application/zip') return true;
    }
    // Allow zip/rar by extension (type might be blank)
    const ext = file.name?.split('.').pop()?.toLowerCase();
    if (ext === 'zip' || ext === 'rar') return true;
    return true;
  });

  formState.value.task_file = fileList;

  if (fileList.length === 0) {
    errors.value.task_file = 'Please upload at least one image file';
  } else {
    errors.value.task_file = '';
  }
};

const handleSampleUpload = (file) => {
  if (formState.value.sample_images.length >= 3) {
    errors.value.sample_image = 'Maximum 3 sample images allowed';
    return false;
  }
  formState.value.sample_images.push(file);
  errors.value.sample_image = '';
  return false; // prevent auto upload
};

const removeSampleImage = (index) => {
  formState.value.sample_images.splice(index, 1);
};

const openSampleModal = () => {
  getSampleImageList();
  samplePage.value = 1;
  // Pre-select currently chosen
  selectedSystemImages.value = formState.value.sample_images
    .filter(img => img.id); // Only system images
  sampleModalVisible.value = true;
};

const handleSamplePageChange = (page) => {
  samplePage.value = page;
  getSampleImageList(page);
};

const toggleSystemImage = (item) => {
  const idx = selectedSystemImages.value.findIndex(img => img.id === item.id);
  if (idx === -1) {
    if (selectedSystemImages.value.length < 3)
      selectedSystemImages.value.push(item);
  } else {
    selectedSystemImages.value.splice(idx, 1);
  }
};

const createObjectURL = (file) => {
  return URL.createObjectURL(file);
}

const confirmSystemImageSelection = () => {
  // Merge system-selected and uploaded (not exceeding 3)
  const uploaded = formState.value.sample_images.filter(img => !img.id);
  let merged = [...selectedSystemImages.value, ...uploaded].slice(0, 3);
  formState.value.sample_images = merged;
  errors.value.sample_image = '';
  sampleModalVisible.value = false;
};

const cancelSystemImageSelection = () => {
  selectedSystemImages.value = [];
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
  loadDecorativePage(decorativePage.value, '');
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
  // formData.append('size', String(formState.value.size));
  // formData.append('custom_size', formState.value.custom_size || '');
  formData.append('image_text', formState.value.image_text);
  formData.append('task_description', formState.value.task_description);
  formData.append('requester_name', formState.value.requester_name);
  formData.append('deadline', formState.value.deadline);

  formState.value.sample_images.forEach((img, i) => {
    if (img.id) {
      formData.append(`sample_images[${i}]`, String(img.id));
    } else {
      const actualFile = img.originFileObj || img;
      formData.append(`sample_images[${i}]`, actualFile);
    }
  });

  formState.value.sizes.forEach((id) => {
    formData.append('sizes[]', String(id));
  });
  formState.value.custom_sizes.forEach((txt) => {
    if (txt?.trim()) formData.append('custom_sizes[]', txt.trim());
  });

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
    if (actualFile) {
      formData.append('task_file[]', actualFile);
    } else {
      formData.append('task_file[]', fileObj.uid);
    }
  });

  // 👤 Actor images (mixed id or file)
  formState.value.actor_images.forEach((img, i) => {
    if (img.id) {
      formData.append(`actor_images[${i}]`, String(img.id));
    } else {
      const actualFile = img.originFileObj || img;
      formData.append(`actor_images[${i}]`, actualFile);
    }
  });

  // 🖼 Decorative images (mixed id or file)
  formState.value.decorative_images.forEach((img, i) => {
    if (img.id) {
      formData.append(`decorative_images[${i}]`, String(img.id));
    } else {
      const actualFile = img.originFileObj || img;
      formData.append(`decorative_images[${i}]`, actualFile);
    }
  });

  // TODO: Call API here
  isLoading.value = true;
  try {
    const res = await api.post(`/api/task/${props.task.id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    emit('successUpdate');
    console.log(res);
  } catch (err) {
    console.log(err);
  } finally {
    isLoading.value = false
  }
};

const loadActorPageWithWebsite = (siteId) => {
  loadActorPage(1, siteId);
}

const loadActorPageWithPagination = ({ page, site, type }) => {
  loadActorPage(page, site);
}

const loadDecorativePageWithType = (type) => {
  loadDecorativePage(1, type);
}

const loadDecorativePageWithPagination = ({ page, site, type }) => {
  loadDecorativePage(page, type);
}

const fetchWebsitelist = async () => {
  const res = await api.get('/api/websites');
  websiteList.value = res.data.data;
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
    console.log('sizes:', sizeList.value)
    console.log(formState.value.size)
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

const loadDecorativePage = (page, type) => {
  decorativePage.value = page;
  api.get(`/api/get-decorative-image-list?page=${page}&type=${type}`).then(res => {
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

const fetchDecorativeTypes = async () => {
  const res = await api.get('/api/get-decorative-types');
  decorativeTypeList.value = res.data.data;
};

watch(() => formState.value.task_type, (newVal) => {
  formState.value.sizes = [];         // reset selected predefined sizes
  formState.value.custom_sizes = [];  // reset custom sizes too

  if (newVal && newVal !== 'custom') {
    getSizesByTaskType(newVal);
  } else {
    sizeList.value = [];
  }
});

watch(
  () => formState.value.custom_sizes,
  (arr) => {
    if (!arr || !arr.length) {
      errors.value.custom_size = '';
      return;
    }
    const hasBlank = arr.some(s => !s || !String(s).trim());
    errors.value.custom_size = hasBlank ? t('validation.customSizeRequired') : '';
  },
  { deep: true }
);

onMounted(() => {
  if (props.task) {
    const t = props.task;
    console.log(t);
    formState.value = {
      website_id: props.websiteId,
      job_title: t.job_title,
      task_type: t.task_type_id ?? 'custom',
      // custom_task_type: t.type ? t.type.name : '',
      sizes: t.sizes.map(size => size.id),
      custom_sizes: [],
      file_types: JSON.parse(t.file_types || '[]'),
      colors: JSON.parse(t.colors || '[]'),
      themes: t.themes.map(theme => theme.id),
      custom_themes: [], // up to you to detect which ones are custom
      image_text: t.image_text,
      task_description: t.task_description,
      task_file: t.files.map(f => ({
        uid: f.id,
        name: f.file_name,
        status: 'done',
        url: f.storage_url,
        thumbUrl: f.storage_url
      })),
      sample_images: t.sample_images || [],
      // sample_image_type: 'system',
      actor_images: t.actor_images || [],
      decorative_images: t.decorative_images || [],
      requester_name: t.requester_name,
      deadline: t.deadline ? dayjs(t.deadline) : null,
      assignee: t.assignee?.id || null,
    };

  }
  fetchWebsitelist()
  getTaskTypeList()
  getSizesByTaskType(props.task.task_type_id);
  getFileTypeList()
  getColorList()
  // getThemeNameList()
  fetchDecorativeTypes()
})

const validateForm = () => {
  let hasError = false

  // reset errors
  Object.keys(errors.value).forEach(k => (errors.value[k] = ''))

  // Job Title
  if (!formState.value.job_title?.trim()) {
    errors.value.job_title = t('validation.jobTitleRequired')
    hasError = true
  }

  // Task Type
  if (!formState.value.task_type) {
    errors.value.task_type = t('validation.taskTypeRequired')
    hasError = true
  } else if (
    formState.value.task_type === 'custom' &&
    !formState.value.custom_task_type?.trim()
  ) {
    errors.value.custom_task_type = t('validation.customTaskTypeRequired')
    hasError = true
  }

  // Size
  // if (!formState.value.size) {
  //     errors.value.size = t('validation.sizeRequired')
  //     hasError = true
  // } else if (
  //     formState.value.size === 'custom' &&
  //     !formState.value.custom_size?.trim()
  // ) {
  //     errors.value.custom_size = t('validation.customSizeRequired')
  //     hasError = true
  // }

  // Size (required; total <= 5)
  if (totalSizeCount.value === 0) {
    errors.value.size = t('validation.sizeRequired');
    hasError = true;
  } else if (totalSizeCount.value > 5) {
    errors.value.size = t('validation.maxSizes', { max: 5 });
    hasError = true;
  }

  // ✅ Custom sizes must not be blank if any are added
  if (formState.value.custom_sizes.length > 0) {
    const hasBlank = formState.value.custom_sizes.some(s => !s || !String(s).trim());
    if (hasBlank) {
      errors.value.custom_size = t('validation.customSizeRequired'); // make sure this i18n key exists
      hasError = true;
    } else {
      errors.value.custom_size = '';
    }
  }

  // File Types
  if (!formState.value.file_types.length) {
    errors.value.file_types = t('validation.fileTypesRequired')
    hasError = true
  }

  // colors
  // if (!formState.value.colors.length) {
  //   errors.value.colors = t('validation.ColorsRequired')
  // }

  // Image Text
  if (!formState.value.image_text?.trim()) {
    errors.value.image_text = t('validation.imageTextRequired')
    hasError = true
  }

  // Task Description
  if (!formState.value.task_description?.trim()) {
    errors.value.task_description = t('validation.taskDescriptionRequired')
    hasError = true
  }

  // Sample Image
  if (!formState.value.sample_images.length) {
    errors.value.sample_image = t('validation.sampleImageRequired')
    hasError = true
  } else if (formState.value.sample_images.length > 3) {
    errors.value.sample_image = 'Maximum 3 sample images allowed'
    hasError = true
  }

  // Requester Name
  if (!formState.value.requester_name?.trim()) {
    errors.value.requester_name = t('validation.requesterNameRequired')
    hasError = true
  }

  // Deadline
  if (!formState.value.deadline) {
    errors.value.deadline = t('validation.deadlineRequired')
    hasError = true
  }

  return !hasError
}

</script>
