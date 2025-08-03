<template>
    <a-image v-model:previewVisible="previewVisible" :src="internalSrc"
        :preview="{ visible: previewVisible, onVisibleChange: onVisibleChange }" style="display: none" />
</template>

<script setup>
import { ref, defineExpose } from 'vue'

const previewVisible = ref(false)
const internalSrc = ref('')

function onVisibleChange(val) {
    previewVisible.value = val
}

function openPreview(imageSrc) {
    if (imageSrc) {
        internalSrc.value = imageSrc
        previewVisible.value = true
    }
}

defineExpose({
    openPreview
})
</script>
