<template>
    <a-modal :open="visible" title="Edit a Role" :footer="null" :closable="false" centered>
        <a-divider></a-divider>

        <a-form :model="formState" name="edit_role" layout="vertical" autocomplete="off" @finish="onSubmit"
            class="w-full" @finishFailed="onFinishFailed">
            <!-- Role Name -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Name" name="name"
                        :rules="[{ required: true, message: 'please input role name!' }]"
                        :validate-status="errors.name ? 'error' : ''" :help="errors.name">
                        <a-input v-model:value="formState.name" class="w-full" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Permissions -->
            <a-row>
                <a-col :span="24">
                    <div class="font-medium mb-2">Permissions</div>
                    <a-divider></a-divider>

                    <div class="pr-2 space-y-4">
                        <div v-for="(permissions, group) in permissionList" :key="group" class="pb-2 mb-3 gap-3">
                            <div class="flex items-center justify-between !mb-2 cursor-pointer w-full"
                                @click="toggleCollapse(group)">
                                <a-checkbox :checked="isGroupChecked(group)"
                                    :indeterminate="isGroupIndeterminate(group)" @click.stop="toggleGroup(group)">
                                    <span class="font-semibold capitalize">
                                        {{ group.replace(/_/g, ' ') }}
                                    </span>
                                </a-checkbox>
                                <DownOutlined class="text-xs text-gray-500 select-none" v-if="isCollapsed(group)" />
                                <UpOutlined class="text-xs text-gray-500 select-none" v-else />
                            </div>

                            <div v-show="!isCollapsed(group)" class="block mt-2 !space-y-2">
                                <a-checkbox v-for="perm in permissions" :key="perm.id"
                                    :checked="formState.permission_ids.includes(perm.id)"
                                    @change="togglePermission(perm.id)" class="mr-4 mb-1 block">
                                    {{ formatPermissionName(perm.name) }}
                                </a-checkbox>
                            </div>

                            <a-divider></a-divider>
                        </div>
                    </div>
                </a-col>
            </a-row>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-4">
                <a-button @click="cancel">Cancel</a-button>
                <a-button html-type="submit" type="primary" :disabled="isLoading">Update</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { formatPermissionName } from '@/utils/format'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    visible: Boolean,
    permissionList: Object,
    role: Object,
})
const emit = defineEmits(['close', 'updated'])

const formState = ref({ name: '', permission_ids: [] })
const errors = ref({ name: '' })
const isLoading = ref(false)
const collapsedGroups = ref({})

// Reset modal when opened
watch(() => props.visible, (val) => {
    if (val && props.role) {
        formState.value.name = props.role.name
        formState.value.permission_ids = props.role.permissions.map(p => p.id)
        collapsedGroups.value = {}
        errors.value.name = ''
    }
})

// Submission logic
const onSubmit = async () => {
    isLoading.value = true
    errors.value.name = ''
    try {
        await api.post(`/api/role/${props.role.id}/update`, formState.value)
        const auth = useAuthStore();
        if (auth.user.role_id == props.role.id) {
            auth.loaded = false;
            await auth.fetchUser();
        }
        emit('updated')
        emit('close')
    } catch (err) {
        const response = err?.response
        if (response?.data?.message) {
            errors.value.name = response.data.message
        }
    } finally {
        isLoading.value = false
    }
}

const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
}

// Collapse/Expand
const toggleCollapse = (group) => {
    collapsedGroups.value[group] = !collapsedGroups.value[group]
}
const isCollapsed = (group) => {
    return collapsedGroups.value[group] === true
}

// Permission logic
const togglePermission = (id) => {
    const index = formState.value.permission_ids.indexOf(id)
    if (index >= 0) {
        formState.value.permission_ids.splice(index, 1)
    } else {
        formState.value.permission_ids.push(id)
    }
}

const isGroupChecked = (group) => {
    const ids = props.permissionList[group].map(p => p.id)
    return ids.every(id => formState.value.permission_ids.includes(id))
}

const isGroupIndeterminate = (group) => {
    const ids = props.permissionList[group].map(p => p.id)
    const selected = ids.filter(id => formState.value.permission_ids.includes(id))
    return selected.length > 0 && selected.length < ids.length
}

const toggleGroup = (group) => {
    const ids = props.permissionList[group].map(p => p.id)
    const allChecked = isGroupChecked(group)

    if (allChecked) {
        formState.value.permission_ids = formState.value.permission_ids.filter(
            id => !ids.includes(id)
        )
    } else {
        formState.value.permission_ids = Array.from(new Set([
            ...formState.value.permission_ids,
            ...ids
        ]))
    }
}

const cancel = () => {
    emit('close')
}
</script>
