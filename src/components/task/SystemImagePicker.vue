<template>
    <a-modal :visible="visible" :title="title" @ok="handleConfirm" @cancel="handleCancel" width="800px" ok-text="Select"
        cancel-text="Cancel">
        <div class="h-[70vh] overflow-auto !mb-4">
            <a-select v-if="websiteList.length > 0" v-model:value="selectedWebsite" placeholder="Select website"
                class="!mb-4 w-60" @change="handleWebsiteChange">
                <a-select-option v-for="site in websiteList" :key="site.value" :value="site.value">
                    {{ site.label }}
                </a-select-option>
            </a-select>
            <div class="flex h-auto gap-4 !mt-4 flex-wrap">
                <div v-for="item in imageList" :key="item.id" :class="[
                    'cursor-pointer border rounded overflow-hidden transition',
                    selectedIds.has(item.id)
                        ? 'bg-blue-200'
                        : 'hover:bg-blue-100'
                ]" @click="toggleSelection(item.id)">
                    <div class="relative w-40 h-40">
                        <!-- Delete Icon -->
                        <CheckCircleOutlined v-if="selectedIds.has(item.id)"
                            class="absolute top-1 right-1 !text-green-500 bg-white rounded-full shadow-md z-10 text-xl" />
                        <!-- Image -->
                        <img :src="item.thumbnail_url" alt="actor"
                            class="!w-40 !h-40 object-fill !border !border-gray-200 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>

        <a-pagination class="mt-4 flex justify-end" :current="currentPage" :page-size="pageSize" :total="total"
            @change="handlePageChange" show-less-items />

    </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { CheckCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps({
    visible: Boolean,
    imageList: Array,
    total: Number,                // ✅ total image count for pagination
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
    }
});

const selectedWebsite = ref(null);

const emit = defineEmits([
    'update:selected',
    'confirm',
    'cancel',
    'page-change',
    'website-change'
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
    emit('page-change', page);
};

const handleWebsiteChange = (value) => {
    selectedWebsite.value = value;
    emit('website-change', value);
};

</script>
