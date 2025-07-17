<template>
    <div class="flex gap-2">
        <a-avatar class="!bg-[#f56a00]" :size="32" :gap="4">
            {{ getInitials(user.name) }}
        </a-avatar>
        <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-medium">{{ user.name }}</span>
            <span class="truncate text-xs text-muted-foreground cursor-pointer underline text-green-500">view
                profile</span>
        </div>
    </div>

</template>
<script setup lang="ts">
import { getInitials } from '@/utils/initials';

defineProps({
    user: Object,
})
</script>