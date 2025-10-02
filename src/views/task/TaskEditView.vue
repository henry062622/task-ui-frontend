<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import api from '@/lib/axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import TaskView from '@/components/task/TaskView.vue';
import TaskEditComponent from '@/components/task/TaskEditComponent.vue';

const route = useRoute();
const router = useRouter();

const task = ref(null);
const taskId = ref(route.params.id)
const userList = ref([]);

// tiny helper: treat '1'/'true' as true
const isTruthy = (v) => v === '1' || v === 'true' || v === true;

// IMPORTANT: initialize from query (?edit=1)
const showView = ref(!isTruthy(route.query.edit));

const getTaskDetail = async () => {
  const { data } = await api.get(`/api/tasks/${taskId.value}`);
  task.value = data.data;
};

const getUserNameList = () => {
  api.get('/api/get-user-name-list-by-ui-role').then(res => {
    userList.value = res.data.data;
  });
};

// keep URL <-> UI in sync
const enterEditMode = () => {
  showView.value = false;
  router.replace({ path: route.path, query: { ...route.query, edit: '1' } });
};

const exitEditMode = () => {
  showView.value = true;
  // remove the ?edit flag from the URL
  const nextQuery = { ...route.query };
  delete nextQuery.edit;
  router.replace({ path: route.path, query: nextQuery });
};

const updated = () => {
  // after successful update → go back to view and refresh data
  exitEditMode();
  getTaskDetail();
};

onMounted(() => {
  getTaskDetail();
  getUserNameList();
});

// react if the URL query changes (e.g., user edits the URL)
watch(() => route.query.edit, (v) => {
  showView.value = !isTruthy(v);
});

// keep task id up to date if the route changes
watch(() => route.params.id, (newId) => {
  taskId.value = newId;
  getTaskDetail();
});
</script>

<template>
  <DefaultLayout>
    <a-breadcrumb>
      <a-breadcrumb-item>
        <RouterLink to="/dashboard">{{ $t('dashboard') }}</RouterLink>
      </a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('title') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex h-auto bg-white w-full flex-1 flex-col gap-4 rounded-xl shadow-2xl p-4 !mt-4">
      <!-- VIEW -->
      <TaskView v-if="task && showView" :task="task" :user-list="userList" @fetchDetail="getTaskDetail"
        @clickEdit="enterEditMode" />

      <!-- EDIT -->
      <TaskEditComponent v-if="task && !showView" :task="task" :user-list="userList" :website-id="task.website_id"
        @clickCancelBtn="exitEditMode" @successUpdate="updated" />
    </div>
  </DefaultLayout>
</template>
