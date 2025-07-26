<template>
    <a-image :src="imageUrl" alt="Preview" class="aspect-[4/5] !object-fill !border !border-gray-200 rounded-lg" />
</template>
<script setup>
defineProps({
    imageUrl: {
        type: String,
        required: true
    }
})
</script>
