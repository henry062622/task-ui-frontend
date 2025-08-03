<template>
    <a-modal :open="visible" :title="title" @ok="handleConfirm" @cancel="handleCancel" width="800px"
        :ok-text="$t('select')" :cancel-text="$t('cancel')">
        <div class="h-[70vh] overflow-auto !mb-4">
            <a-select v-if="websiteList.length > 0" v-model:value="selectedWebsite"
                :placeholder="$t('select_model_list')" class="!mb-4 w-60" @change="handleWebsiteChange" allow-clear>
                <a-select-option v-for="site in websiteList" :key="site.id" :value="site.id">
                    model{{ site.name }}
                </a-select-option>
                <a-select-option value="other">modelOther</a-select-option>
            </a-select>
            <a-select v-if="decorativeTypes.length > 0" v-model:value="selectedtype" :placeholder="$t('select')"
                class="!mb-4 w-80" @change="handleDecorativeTypeChange" allow-clear>
                <a-select-option v-for="type in decorativeTypes" :key="type.key" :value="type.key">
                    {{ type.value }}
                </a-select-option>
            </a-select>
            <div class="flex h-auto gap-4 !mt-4 flex-wrap">
                <div v-for="item in imageList" :key="item.id" :class="[
                    'cursor-pointer border border-gray-200 rounded-lg overflow-hidden transition',
                    selectedIds.has(item.id)
                        ? 'bg-blue-200'
                        : 'hover:bg-blue-100'
                ]" @click="toggleSelection(item.id)">
                    <div class="relative !w-30 group">
                        <!-- Delete Icon -->
                        <CheckCircleOutlined v-if="selectedIds.has(item.id)"
                            class="absolute top-1 right-1 !text-green-500 bg-white rounded-full shadow-md z-10 text-xl" />
                        <!-- Image -->
                        <img :src="item.thumbnail_url" alt="actor" class="!w-30 aspect-[4/5] object-fill" />
                        <!-- View icon overlay -->
                        <EyeOutlined
                            class="absolute bottom-1 right-1 cursor-pointer bg-gray-300 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            @click.stop="previewRef.openPreview(item.storage_url)" />
                    </div>
                </div>
            </div>
        </div>

        <a-pagination class="mt-4 flex justify-end" :current="currentPage" :page-size="pageSize" :total="total"
            width="100%" show-quick-jumper @change="handlePageChange" show-less-items :showSizeChanger="false" />

    </a-modal>
    <!-- show preview for sample -->
    <CustomPreviewImage ref="previewRef" />
</template>

<script setup>
import { ref, watch } from 'vue';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons-vue';
import CustomPreviewImage from '../ui/CustomPreviewImage.vue';

const props = defineProps({
    visible: Boolean,
    imageList: Array,
    total: Number,
    selected: Array,
    title: {
        type: String,
        default: 'Select Images'
    },
    pageSize: {
        type: Number,
        default: 25
    },
    currentPage: {
        type: Number,
        default: 1
    },
    websiteList: {
        type: Array,
        default: []
    },
    decorativeTypes: {
        type: Array,
        default: []
    }
});

const selectedWebsite = ref(null);
const selectedtype = ref(null);
const previewRef = ref(null);

const emit = defineEmits([
    'update:selected',
    'confirm',
    'cancel',
    'page-change',
    'website-change',
    'decorative-type-change'
]);

const selectedIds = ref(new Set([...props.selected]));

watch(() => props.visible, (val) => {
    if (val) {
        console.log(val);
        selectedIds.value.clear();
    }
});

const toggleSelection = (id) => {
    if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id);
    } else {
        selectedIds.value.add(id);
    }
};

const handleConfirm = () => {
    emit('update:selected', Array.from(selectedIds.value));
    emit('confirm');
};

const handleCancel = () => {
    emit('cancel');
};

const handlePageChange = (page) => {
    emit('page-change', { page, site: selectedWebsite.value ?? '', type: selectedtype.value ?? '' });
};

const handleWebsiteChange = (value) => {
    selectedWebsite.value = value ?? null;
    emit('website-change', selectedWebsite.value ?? '');
};

const handleDecorativeTypeChange = (value) => {
    selectedtype.value = value ?? null;
    emit('decorative-type-change', selectedtype.value ?? '');
};
</script>
