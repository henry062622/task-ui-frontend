<template>
    <a-modal v-model:visible="visibleLocal" :title="$t('pasteImageHere')" @ok="handleOk"
        @cancel="() => visibleLocal = false" :ok-button-props="{ disabled: !selectedTarget }">
        <div class="flex flex-col items-center gap-4">
            <img v-if="pastedFile" :src="previewUrl" class="max-w-full max-h-64 border" alt="pasted img" />

            <a-select v-model:value="selectedTarget" :placeholder="$t('selectPasteTarget')" class="w-full"
                :options="options" />
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

/** Props & emits **/
const props = defineProps<{
    modelValue: boolean
    options: { label: string; value: string }[]
}>()
const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'confirm', payload: { file: File; target: string }): void
}>()

/** i18n **/
const { t } = useI18n()

/** Local v-model proxy **/
const visibleLocal = ref(props.modelValue)
watch(() => props.modelValue, v => (visibleLocal.value = v))
watch(visibleLocal, v => emit('update:modelValue', v))

/** Paste state **/
const pastedFile = ref<File | null>(null)
const selectedTarget = ref<string | null>(null)

/** Preview URL **/
const previewUrl = computed(() =>
    pastedFile.value ? URL.createObjectURL(pastedFile.value) : ''
)

/** Handle the paste event **/
function onPaste(e: ClipboardEvent) {
    const files = Array.from(e.clipboardData?.files || []).filter(f =>
        f.type.startsWith('image/')
    )
    if (files.length) {
        pastedFile.value = files[0]
        selectedTarget.value = null
        visibleLocal.value = true
    }
}

/** Hook up / tear down **/
onMounted(() => window.addEventListener('paste', onPaste))
onBeforeUnmount(() => window.removeEventListener('paste', onPaste))

/** OK button **/
function handleOk() {
    if (pastedFile.value && selectedTarget.value) {
        emit('confirm', { file: pastedFile.value, target: selectedTarget.value })
        pastedFile.value = null
        selectedTarget.value = null
        visibleLocal.value = false
    }
}
</script>
