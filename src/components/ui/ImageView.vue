<template>
    <a-image :src="image.thumbnail_url" alt="Preview" :preview="{ src: image.storage_url }"
        class="aspect-[4/5] !object-fill !border !border-gray-200 rounded-lg" />
</template>
<script setup>
defineProps({
    image: {
        type: Object,
        required: true
    }
})
</script>
