<template>
  <div
    class="bg-white rounded-2xl w-52 h-30  shadow-md text-center transition-all duration-200 ease-in-out cursor-pointer hover:translate-y-[-5px] hover:shadow-lg">
    <!-- Content goes here -->
    <div class="flex w-full h-2/3 bg-gray-300 rounded-tr-2xl rounded-tl-2xl p-5">
      <img v-if="website.logo_url" :src="website.logo_url" alt="site_logo" class="site-logo w-2/3 h-full">
      <div v-else ref="container" class="w-2/3 h-full overflow-hidden relative">
        <span ref="text" :class="[
          'whitespace-nowrap text-4xl !font-extrabold inline-block',
          isOverflow ? 'scroll-text' : ''
        ]">
          {{ website.name }}
        </span>
      </div>
      <span class="w-1/3 text-center text-lg text-gray-950 flex justify-center items-center pl-4 !font-bold">{{
        website.name }}</span>
    </div>
    <div class="h-1/3 flex justify-center items-center self-center text-sm text-gray-500"> {{
      website.description }} </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'

defineProps({
  website: Object
})

const container = ref(null)
const text = ref(null)
const isOverflow = ref(false)

onMounted(async () => {
  await nextTick()
  if (container.value && text.value) {
    isOverflow.value =
      text.value.scrollWidth > container.value.clientWidth
  }
})
</script>
<style>
.scroll-text {
  animation: scroll-left 6s linear infinite;
}

@keyframes scroll-left {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}
</style>
