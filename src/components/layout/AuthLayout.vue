<script setup>
import AuthSimpleLayout from './auth/AuthSimpleLayout.vue';

defineProps({
    title: "",
    description: ""
});
</script>

<template>
    <AuthSimpleLayout :title="title" :description="description">
        <slot />
    </AuthSimpleLayout>
</template>
