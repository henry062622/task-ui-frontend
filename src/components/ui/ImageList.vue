<template>
    <div class="w-[120px]" v-for="img in imageList">
        <ImageView :image="img" />
    </div>
</template>
<script setup>
import ImageView from './ImageView.vue';
defineProps({
    imageList: {
        type: Array,
        required: true
    }
});
</script>
