<template>
    <div class="flex gap-2">
        <a-avatar class="!bg-[#f56a00]" :size="37" :gap="4">
            {{ getInitials(user.name) }}
        </a-avatar>
        <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate !font-bold">{{ user.name }}</span>
            <span class="truncate text-xs text-muted-foreground cursor-pointer text-gray-500">{{ user.email
            }}</span>
        </div>
    </div>

</template>
<script setup lang="ts">
import router from '@/router';
import { getInitials } from '@/utils/initials';

defineProps({
    user: Object,
})


</script>