<template>
    <DefaultLayout>
        <div class="flex h-auto bg-white w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4 ">
            <!-- view form  -->
            <TaskView v-if="task && showView" :task="task" :user-list="userList" @fetchDetail="getTaskDetail"
                @clickEdit="showView = false">
            </TaskView>
            <TaskEditComponent v-if="task && !showView" :task="task" :user-list="userList" :website-id="task.website_id"
                @clickCancelBtn="showView = true" @successUpdate="updated"></TaskEditComponent>
        </div>
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import api from '@/lib/axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import TaskView from '@/components/task/TaskView.vue';
import TaskEditComponent from '@/components/task/TaskEditComponent.vue';

const route = useRoute();

const showView = ref(true);
const task = ref(null);
const taskId = route.params.id
const userList = ref([]);

const getTaskDetail = async () => {
    await api.get(`/api/tasks/${taskId}`).then(res => {
        task.value = res.data.data;
    })
}

const getUserNameList = () => {
    api.get('/api/get-user-name-list-by-ui-role').then(res => {
        userList.value = res.data.data;
    });
}

const updated = () => {
    showView.value = true;
    getTaskDetail();
}

onMounted(() => {
    getTaskDetail();
    getUserNameList()
})
</script>