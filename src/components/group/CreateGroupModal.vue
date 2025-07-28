<template>
    <a-modal :open="visible" title="Create a Group" :footer="null" :closable="false" centered>
        <a-divider></a-divider>

        <a-form :model="formState" name="create_group" layout="vertical" autocomplete="off" @finish="onSubmit"
            class="w-full" @finishFailed="onFinishFailed">
            <!-- Group Name -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Name" name="name"
                        :rules="[{ required: true, message: 'please input group name!' }]"
                        :validate-status="errors.name ? 'error' : ''" :help="errors.name">
                        <a-input v-model:value="formState.name" class="w-full" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- Users Section -->
            <a-row>
                <a-col :span="24">
                    <a-form-item label="Assign Users">
                        <!-- Dropdown to select unassigned user -->
                        <a-select v-model:value="selectedUserId" placeholder="Select user to assign" show-search
                            allow-clear style="width: 100%" @change="assignUser">
                            <a-select-option v-for="user in unassignedUserList" :key="user.id" :value="user.id">
                                {{ user.name }} ({{ user.email }})
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <!-- Assigned User Table -->
                    <a-table :columns="userColumns" :data-source="formState.user_ids.map(id => getUserById(id))"
                        row-key="id" size="small" bordered :pagination="false">
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.dataIndex === 'action'">
                                <a-popconfirm title="Sure to unassign?" @confirm="removeUser(record.id)">
                                    <DeleteOutlined style="color: red;" />
                                </a-popconfirm>
                            </template>
                        </template>
                    </a-table>
                </a-col>
            </a-row>


            <!-- Footer Buttons -->
            <div class="flex items-center justify-end gap-4 pt-4">
                <a-button @click="cancel">Cancel</a-button>
                <a-button html-type="submit" type="primary" :loading="isLoading" :disabled="isLoading">Create</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import api from '@/lib/axios'
import { DeleteOutlined } from '@ant-design/icons-vue'

const props = defineProps({
    visible: Boolean
})
const emit = defineEmits(['close', 'created'])

const formState = ref({ name: '', user_ids: [] });
const errors = ref({ name: '' });
const isLoading = ref(false);
const unassignedUserList = ref([]);
const selectedUserId = ref(null)
const allUsers = ref([])

const userColumns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Action',
        key: 'action',
        dataIndex: 'action',
        width: 100
    },
]

// Assign user to list
const assignUser = (userId) => {
    if (!userId) return
    if (!formState.value.user_ids.includes(userId)) {
        formState.value.user_ids.push(userId)
        unassignedUserList.value = unassignedUserList.value.filter(u => u.id !== userId)
    }
    selectedUserId.value = null
}

// Remove user from list
const removeUser = (userId) => {
    const user = getUserById(userId)
    if (user) unassignedUserList.value.push(user)
    formState.value.user_ids = formState.value.user_ids.filter(id => id !== userId)
}

// Lookup helper
const getUserById = (id) => allUsers.value.find(u => u.id === id)

// Reset modal when opened
watch(() => props.visible, (val) => {
    if (val) {
        formState.value.name = ''
        formState.value.user_ids = []
        errors.value.name = ''
    }
})

// Submission logic
const onSubmit = async () => {
    console.log(formState.value);
    isLoading.value = true
    errors.value.name = ''
    try {
        await api.post('/api/group/create', formState.value)
        emit('created')
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

// Fetch data
const fetchUnassignedUserlist = async () => {
    const res = await api.get('/api/users/unassigned');
    unassignedUserList.value = res.data.data;
    allUsers.value = res.data.data
}

// Init
onMounted(() => {
    fetchUnassignedUserlist();
})

const cancel = () => {
    emit('close')
}
</script>
