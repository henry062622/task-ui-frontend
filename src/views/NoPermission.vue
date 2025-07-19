<template>
    <DefaultLayout :breadcrumb-list="[]">
        <div class="flex h-full w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4">
            <div class="no-permission h-full text-center flex flex-col text-red-600 justify-center items-center">
                <h1>You do not have permission to access this page.</h1>
                <p>Please contact the administrator for assistance.</p>
            </div>
        </div>
    </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'

</script>
