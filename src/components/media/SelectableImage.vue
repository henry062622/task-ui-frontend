<!-- components/media/SelectableImage.vue -->
<template>
  <div class="relative overflow-hidden rounded-lg border border-gray-200 aspect-[4/5] cursor-pointer"
    :class="selected ? 'ring-2 ring-blue-500' : ''" :style="containerStyle" @click="onClick">
    <!-- fixed-ratio container; the img fills it -->
    <img :src="image.thumbnail_url" :alt="image.file_name || 'Preview'"
      class="w-full h-full object-fill block select-none" draggable="false" />

    <!-- Hidden AntD image used only for the lightbox preview -->
    <a-image v-if="image.storage_url" :src="image.storage_url" :preview="{
      visible: previewVisible,
      onVisibleChange: (v) => (previewVisible = v)
    }" style="display:none" />

    <!-- selection badge -->
    <div v-if="selected" class="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
      Selected
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  image: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  width: { type: [Number, String], default: 120 }, // 120px like your card
})

const emit = defineEmits(['toggle'])

const previewVisible = ref(false)
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}))

function onClick(e) {
  // Ctrl (Win/Linux) or Cmd (macOS) => only toggle selection
  if (e.ctrlKey || e.metaKey) {
    emit('toggle', props.image)
    e.preventDefault()
    e.stopPropagation()
    return
  }
  // normal click => show preview
  previewVisible.value = true
}
</script>
