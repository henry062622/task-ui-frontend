<template>
    <div
        class="bg-white rounded-2xl w-52 h-30  shadow-md text-center transition-all duration-200 ease-in-out cursor-pointer hover:translate-y-[-5px] hover:shadow-lg">
        <!-- Content goes here -->
        <div class="flex w-full h-2/3 bg-gray-300 rounded-tr-2xl rounded-tl-2xl p-5">
            <img :src="website.logo_url" alt="site_logo" class="site-logo w-2/3 h-full">
            <span class="w-1/3 text-center text-lg text-gray-950 flex justify-center items-center pl-4 !font-bold">{{
                website.name }}</span>
        </div>
        <div class="h-1/3 flex justify-center items-center self-center text-sm text-gray-500"> {{
            website.description }} </div>
    </div>
</template>
<script setup>
defineProps({
    website: {
        type: Object,
        required: true
    }
});
</script>