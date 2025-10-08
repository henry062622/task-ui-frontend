<template>
  <DefaultLayout>
    <div class="flex justify-between items-center p-4 pt-3">
      <a-breadcrumb>
        <a-breadcrumb-item v-for="breadcrumb in breadcrumbList">{{ $t(breadcrumb) }}</a-breadcrumb-item>
      </a-breadcrumb>
      <a-button v-if="hasCreatePermission" type="primary" @click="goToCreatePage">{{ $t('create') }}</a-button>
    </div>

    <div class="flex h-full w-full flex-1 flex-col px-4">
      <!-- tabs section -->
      <a-tabs v-if="tabs.length > 0" v-model:activeKey="activeTab" @change="onTabChange">
        <a-tab-pane v-for="tab in tabs" :key="tab.value" :tab="$t(tab.label)"
          class="gap-4 rounded-xl shadow-2xl p-4 pt-4">

          <!-- Search and Filters -->
          <div class="flex gap-4 !mb-4">
            <a-input-search v-if="currentTab?.showSearch" v-model:value="searchQuery"
              :placeholder="$t('search_by_pj_name')" @search="handleSearch" allow-clear style="width: 250px" />

            <a-select v-model:value="filters.website" :placeholder="$t('website')" @change="handleFilter"
              style="width: 180px" allow-clear show-search :filterOption="false" @search="onSearchWebsite">
              <a-select-option v-for="data in filteredWebsiteList" :key="data.id" :value="data.id">
                {{ data.name }}
              </a-select-option>
            </a-select>

            <a-select v-if="currentTab?.filters.includes('status')" v-model:value="filters.status"
              :placeholder="$t('status')" @change="handleFilter" style="width: 110px" allow-clear>
              <a-select-option value="pending">Pending</a-select-option>
              <a-select-option value="in-progress">In Progress</a-select-option>
              <a-select-option value="complete">Completed</a-select-option>
              <a-select-option value="cancel">Cancelled</a-select-option>
            </a-select>

            <a-select v-if="currentTab?.filters.includes('type')" v-model:value="filters.type" :placeholder="$t('type')"
              @change="handleFilter" allow-clear style="width: 220px">
              <a-select-option v-for="type in taskTypeList" :key="type.id" :value="type.id"> {{ type.name
                }} </a-select-option>
            </a-select>

            <a-select v-if="currentTab?.filters.includes('assignee')" v-model:value="filters.assignee"
              :placeholder="$t('assignee')" @change="handleFilter" allow-clear style="width: 180px">
              <a-select-option v-for="user in userList" :key="user.id" :value="user.id"> {{ user.name
                }} </a-select-option>
            </a-select>

            <a-select v-model:value="filters.creator" :placeholder="$t('task_creator')" @change="handleFilter"
              style="width: 220px" allow-clear show-search :filterOption="false" @search="onSearchCreator"
              :notFoundContent="creatorSearchLoading ? 'Loading...' : undefined">
              <a-select-option v-for="u in filteredCreatorList" :key="u.id" :value="u.id">
                {{ u.name }}
              </a-select-option>
            </a-select>

            <a-range-picker v-model:value="filters.dateRange" :placeholder="[t('fromDate'), t('toDate')]"
              :disabled-date="disabledDate" @calendarChange="onCalendarChange" @change="handleFilter"
              style="width: 250px" />
          </div>

          <!-- Table -->
          <a-table :columns="columns" :data-source="tasks" :pagination="pagination" :loading="loading" row-key="id"
            @change="handleTableChange" bordered>
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'created_at'">
                <span>{{ formatDate(record.created_at) }}</span>
              </template>
              <template v-if="column.key === 'status'">
                <a-tag :color="getColor(record.status)"> {{ getStatusLabel(record.status, userRoleId,
                  uiRoleId) }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <div class="flex justify-center items-center gap-2">
                  <EyeOutlined
                    v-if="currentTab?.buttons.includes('see_more') && (hasViewPermission || record.assignee?.id == auth.user.id)"
                    @click="viewTask(record.id)" />

                  <a-button v-if="currentTab?.buttons.includes('edit') && canEdit(record)" @click="editTask(record.id)"
                    class="!flex items-center justify-center gap-1">
                    <EditOutlined />
                    {{ $t('edit') }}
                  </a-button>

                  <a-button v-if="currentTab?.buttons.includes('in-progress') && record.status == 'pending'"
                    @click="updateTaskStatus('in-progress', record.id)">
                    {{ $t('in_progress') }}
                  </a-button>

                  <!-- 1) Submit for Review (UI role only) -->
                  <a-button
                    v-if="currentTab?.buttons.includes('submit') && (record.status == 'in-progress') && record.assignee?.id == auth.user.id"
                    @click="clickSubmitReview(record.id)">
                    {{ $t('submit_for_review') }}
                  </a-button>

                  <!-- 2) Mark as Reviewed (lead/other role only) -->
                  <a-button
                    v-if="currentTab?.buttons.includes('review') && record.status === 'waiting-for-review' && hasReviewPermission"
                    @click="clickMarkReview(record.id)">
                    {{ $t('reviewed') }}
                  </a-button>

                  <!-- <a-button
                                        v-if="currentTab?.buttons.includes('complete') && record.status == 'in-progress'"
                                        @click="clickCompleteBtn(record.id)">
                                        {{ $t('complete') }}
                                    </a-button> -->

                  <a-button
                    v-if="currentTab?.buttons.includes('cancel') && (record.status == 'pending' || record.status == 'in-progress') && (auth.user.id == record.created_by.id || auth.userRole() == 'super_admin' || auth.userRole() == 'ui_lead')"
                    danger @click="clickCancelBtn(record.id)">
                    {{ $t('cancel') }}
                  </a-button>

                  <a-button v-if="currentTab?.buttons.includes('assign') && hasAssignPermission"
                    @click="assignTask(record.id)">
                    {{ $t('assign') }}
                  </a-button>

                  <a-button
                    v-if="currentTab?.buttons.includes('reassign') && record.status == 'in-progress' && hasAssignPermission"
                    @click="reassignTask(record)">
                    {{ $t('reassign') }}
                  </a-button>

                  <a-button
                    v-if="currentTab?.buttons.includes('need-revision') && record.status === 'complete' && (auth.userRole() === 'super_admin' || auth.userRole() === 'ui_lead')"
                    @click="openNeedRevision(record.id)">
                    {{ $t('needs_revision') }}
                  </a-button>

                  <a-popconfirm
                    v-if="currentTab?.buttons.includes('delete') && !record.assignee && record.created_by.id == auth.user.id && hasDeletePermission"
                    :title="$t('sureToDelete')" @confirm="deleteTask(record.id)">
                    <DeleteOutlined style="color: red;" />
                  </a-popconfirm>
                </div>
              </template>
            </template>
          </a-table>

        </a-tab-pane>
      </a-tabs>
    </div>
    <AssignPopup :visible="showModal" :task-id="selectedTaskId" :user-list="userList"
      :current-assignee-id="selectedTaskAssigneeId" :is-reassign="isReassignMode" @close="showModal = false"
      @assigned="removeAssignedTaskFromList"></AssignPopup>
    <CompletePopup :visible="showCompleteModel" :task-id="selectedTaskId" @completed="actionAfterStatusUpdate"
      @close="showCompleteModel = false"></CompletePopup>
    <CompletePopup :visible="showNeedRevisionModel" :task-id="selectedTaskId" only-need-revision
      @completed="actionAfterStatusUpdate" @close="showNeedRevisionModel = false" />
    <SubmitTaskForReview :visible="showSubmitTaskModel" :task-id="selectedTaskId" @submitTask="actionAfterStatusUpdate"
      @close="showSubmitTaskModel = false"></SubmitTaskForReview>
    <CancelPopup :visible="showCancelModel" :task-id="selectedTaskId" @close="showCancelModel = false"
      @cancelled="actionAfterStatusUpdate"></CancelPopup>
  </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import api from '@/lib/axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { computed, h, onMounted, reactive, ref, onBeforeUnmount, watch } from 'vue';
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import AssignPopup from '@/components/task/AssignPopup.vue';
import CompletePopup from '@/components/task/CompletePopup.vue';
import { formatDate } from '@/utils/format';
import CancelPopup from '@/components/task/CancelPopup.vue';
import { getColor } from '@/utils/initials';
import { useI18n } from 'vue-i18n';
import SubmitTaskForReview from '@/components/task/SubmitTaskForReview.vue';
import { getStatusLabel } from '@/utils/status';
import moment from 'moment'
import makeEcho from '@/lib/echo'

const auth = useAuthStore();
const breadcrumbList = ref(['manager', 'dashboard']);
const activeTab = ref('');
const showModal = ref(false);
const showCompleteModel = ref(false);
const showCancelModel = ref(false);
const showSubmitTaskModel = ref(false);
const showMarkReviewTaskModel = ref(false);

const tabs = ref([]);

const currentTab = computed(() => tabs.value.find((t) => t.value === activeTab.value));
const hasCreatePermission = ref(false);
const hasViewPermission = ref(false);
const hasAssignPermission = ref(false);
const hasDeletePermission = ref(false);
const hasReviewPermission = ref(false);
const hasCancelPermission = ref(false);
const hasEditPermission = ref(false);
const tasks = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const filters = reactive({ status: null, type: null, assignee: null, creator: null, website: null, dateRange: [] });
const taskTypeList = ref([]);
const userList = ref([]);
const selectedTaskId = ref(null);
const userRoleId = auth.user.role_id;
const uiRoleId = import.meta.env.VITE_UI_ROLE_ID;
const { t } = useI18n();

const creatorList = ref([])
const creatorSearchLoading = ref(false) // stays if you show spinner on first load
const creatorQuery = ref('')
const websiteList = ref([]);
const websiteQuery = ref('')

const selectedTaskAssigneeId = ref(null)
const isReassignMode = ref(false)

const echoRoleRef = ref(null)
const roleChannel = ref(null)

const showNeedRevisionModel = ref(false)

const isUiLead = computed(() => auth.userRole && auth.userRole() === 'ui_lead')
const shouldListenHere = computed(() => {
  const tab = currentTab.value?.value
  return isUiLead.value && (tab === 'all_tasks' || tab === 'task_distribution')
})

const echoUserRef = ref(null)
const userChannel = ref(null)

const isUi = computed(() => auth.userRole && auth.userRole() === 'ui')
const shouldListenHereUi = computed(() => {
  const tab = currentTab.value?.value
  return isUi.value && tab === 'my_tasks'
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false
});

const endpointMap = {
  my_tasks: '/api/tasks/my',
  all_tasks: '/api/tasks/all',
  in_progress: '/api/tasks/in-progress',
  waiting_for_review: '/api/tasks/waiting-for-review',
  needs_revision: '/api/tasks/needs-revision',
  complete: '/api/tasks/completed',
  cancel: '/api/tasks/cancelled',
  task_distribution: '/api/tasks/unassigned'
};

// task api
const fetchTasks = async (page = 1) => {
  loading.value = true;
  try {
    const res = await api.get(endpointMap[activeTab.value], {
      params: {
        page,
        search: searchQuery.value,
        status: filters.status,
        type: filters.type,
        assignee: filters.assignee,
        creator: filters.creator,
        start_date: filters.dateRange ? filters.dateRange[0]?.format('YYYY-MM-DD') : '',
        end_date: filters.dateRange ? filters.dateRange[1]?.format('YYYY-MM-DD') : '',
        website: filters.website
      }
    });

    tasks.value = res.data.data.data;
    pagination.total = res.data.data.total;
    pagination.current = res.data.data.current_page;
  } catch (err) {
    console.error('Fetch error', err);
  } finally {
    loading.value = false;
  }
};

const provisionalRange = ref([null, null])  // updated on each calendar click

function onCalendarChange(dates) {
  // dates will be null when the user clears the picker
  provisionalRange.value = Array.isArray(dates) ? dates : [null, null]
}

function disabledDate(current) {
  // safely pull a Moment out of provisionalRange or filters.dateRange
  const start =
    provisionalRange.value?.[0] ??
    (Array.isArray(filters.dateRange) ? filters.dateRange[0] : null)

  // nothing chosen yet
  if (!start) return false

  // disable before start or after  2 months
  return (
    current.isBefore(start, 'day') ||
    current.isAfter(start.clone().add(2, 'months'), 'day')
  )
}

const removeAssignedTaskFromList = (task) => {
  if (!isReassignMode.value) removeTaskFromList(task.id);
  else fetchTasks();
}

const handleSearch = () => {
  fetchTasks(1);
}

const handleFilter = () => {
  fetchTasks(1);
}

const onTabChange = () => {
  pagination.current = 1;
  searchQuery.value = '';
  Object.assign(filters, { status: null, type: null, assignee: null, dateRange: [] });
  fetchTasks(1);
};
const handleTableChange = (pag) => fetchTasks(pag.current);

const viewTask = (id) => {
  // router.push(`/tasks/${id}`);
  const url = `/tasks/${id}`;
  window.open(url, "_blank");
};

const openNeedRevision = (id) => {
  selectedTaskId.value = id
  showNeedRevisionModel.value = true
}

const clickSubmitReview = (id) => {
  selectedTaskId.value = id;
  showSubmitTaskModel.value = true;
}

const clickMarkReview = (id) => {
  selectedTaskId.value = id;
  showCompleteModel.value = true;
}

const clickCompleteBtn = (id) => {
  selectedTaskId.value = id;
  showCompleteModel.value = true;
}

const actionAfterStatusUpdate = (task) => {
  console.log(task);
  if (currentTab.value.value == 'my_tasks') {
    const index = tasks.value.findIndex(data => data.id === task.id);
    console.log(index);
    if (index !== -1) {
      tasks.value[index].status = task.status;
      console.log(tasks.value[index]);
    }
  } else {
    removeTaskFromList(task.id);
  }
};

const clickCancelBtn = (id) => {
  selectedTaskId.value = id
  showCancelModel.value = true
};

const editTask = (id) => {
  // adjust to your actual edit route if different
  router.push({ path: `/tasks/${id}`, query: { edit: '1' } })
}

const deleteTask = (id) => {
  console.log('deleted task', id);
  api.delete(`/api/task/${id}`).then(res => {
    removeTaskFromList(id);
  })
};

// const cancelTask = (task) => {
//     if (currentTab.value.value == 'my_tasks') {
//         const index = tasks.value.findIndex(data => data.id === task.id);
//         if (index !== -1) {
//             tasks.value[index].status = task.status;
//             console.log(tasks.value[index]);
//         }
//     } else {
//         removeTaskFromList(id);
//     }
// }

const updateTaskStatus = (status, id) => {
  api.post('/api/task/change-status', { status, task_id: id }).then(res => {
    if (currentTab.value.value == 'my_tasks') {
      const index = tasks.value.findIndex(task => task.id === id);
      console.log(index);
      if (index !== -1) {
        tasks.value[index].status = status;
        console.log(tasks.value[index]);
      }
    } else {
      removeTaskFromList(id);
    }
  })
}

const assignTask = async (id) => {
  selectedTaskId.value = id;
  selectedTaskAssigneeId.value = null
  isReassignMode.value = false
  showModal.value = true;
};

const reassignTask = (record) => {
  selectedTaskId.value = record.id
  selectedTaskAssigneeId.value = record.assignee?.id || null
  isReassignMode.value = true
  showModal.value = true
}

const removeTaskFromList = (taskId) => {
  tasks.value = tasks.value.filter(data => data.id !== taskId);
}
const columns = computed(() => [
  { title: t('project_name'), dataIndex: 'job_title', key: 'job_title' },
  { title: t('task_creator'), dataIndex: ['created_by', 'name'], key: 'creator' },
  { title: t('assignee'), dataIndex: ['assignee', 'name'], key: 'assignee' },
  { title: t('status'), dataIndex: 'status', key: 'status' },
  { title: t('type'), dataIndex: ['type', 'name'], key: 'type' },
  { title: t('website'), dataIndex: ['website', 'name'], key: 'website' },
  { title: t('created_at'), dataIndex: 'created_at', key: 'created_at' },
  { title: t('action'), key: 'action' }
]);

const goToCreatePage = () => {
  router.push('/task-create');
}

const getTaskTypeList = () => {
  api.get('/api/get-task-type-name-list').then(res => {
    taskTypeList.value = res.data.data;
  });
}

const getUserNameList = () => {
  api.get('/api/get-user-name-list-by-ui-role').then(res => {
    userList.value = res.data.data;
  });
}

function getCreatorNameList(q = '') {
  creatorSearchLoading.value = true
  api.get('/api/get-task-creator-list', { params: { q } })
    .then(res => { creatorList.value = res.data.data || [] })
    .finally(() => { creatorSearchLoading.value = false })
}

const fetchWebsitelist = async () => {
  const res = await api.get('/api/websites');
  websiteList.value = res.data.data;
}

const filteredCreatorList = computed(() => {
  const q = creatorQuery.value.trim().toLowerCase()
  if (!q) return creatorList.value
  return creatorList.value.filter(u => (u.name || '').toLowerCase().includes(q))
})
const filteredWebsiteList = computed(() => {
  const q = websiteQuery.value.trim().toLowerCase()
  if (!q) return websiteList.value
  return websiteList.value.filter(site => (site.name || '').toLowerCase().includes(q))
})

// change your search handler to ONLY update the query (no API call)
function onSearchCreator(value) {
  creatorQuery.value = value || ''
}

function onSearchWebsite(value) {
  websiteQuery.value = value || ''
}

function canEdit(record) {
  const isCreator = record?.created_by?.id === auth.user.id
  const status = record?.status

  // Tab-based: Complete & Task Distribution → only creator can edit
  if (currentTab.value?.value === 'complete' || currentTab.value?.value === 'task_distribution') {
    return (isCreator || auth.userRole() == 'super_admin')
  }

  // Status-based: in-progress, waiting-for-review, needs-revision, cancel
  // → users with task_edit permission can edit, EXCEPT the creator
  const editableStatuses = ['in-progress', 'waiting-for-review', 'needs-revision', 'cancel']
  if (editableStatuses.includes(status)) {
    return auth.userRole() == 'super_admin' || auth.userRole() == 'ui_lead'
  }

  // otherwise, not editable
  return false
}

const getAvailableTabs = () => {
  const isUi = userRoleId == uiRoleId;

  const allTabs = [
    { value: 'my_tasks', label: 'my_tasks', showSearch: true, filters: ['status', 'type'], buttons: ['see_more', 'in-progress', 'submit'] },
    { value: 'all_tasks', label: 'all_tasks', showSearch: true, filters: ['status', 'type', 'assignee'], buttons: ['see_more', 'delete'] },
    { value: 'task_distribution', label: 'task_distribution', showSearch: false, filters: ['type', 'website'], buttons: ['see_more', 'assign', 'delete', 'cancel', 'edit'] },
    { value: 'in_progress', label: 'in_progress', showSearch: false, filters: [], buttons: ['see_more', 'submit', 'reassign', 'edit'] },

    // ⬇️ new “waiting for review” tab
    {
      value: 'waiting_for_review',
      label: isUi ? 'submitted_tasks'   // UI sees “Submitted Tasks”
        : 'waiting_for_review', // others see “Waiting for Review”
      showSearch: false,
      filters: ['type'],
      buttons: ['see_more', 'review', 'edit']
    },

    // ⬇️ new “needs revision” tab
    {
      value: 'needs_revision',
      label: isUi ? 'revisions_required' // UI sees “Revisions Required”
        : 'needs_revision',    // others see “Needs Revision”
      showSearch: false,
      filters: ['type'],
      buttons: ['see_more', 'submit', 'edit']
    },

    { value: 'complete', label: 'complete', showSearch: true, filters: ['type'], buttons: ['see_more', 'edit', 'need-revision'] },
    { value: 'cancel', label: 'cancel', showSearch: true, filters: ['type'], buttons: ['see_more', 'edit'] },

  ];

  // hide “My Tasks” for UI role, hide “Task Distribution” for others
  return isUi
    ? allTabs.filter(t => t.value !== 'task_distribution')
    : allTabs.filter(t => t.value !== 'my_tasks');
}

// socket start
function matchesCurrentTab(task) {
  const tab = currentTab.value?.value
  if (tab === 'task_distribution') return !task?.assignee
  if (tab === 'my_tasks') return task?.assignee?.id === auth.user.id
  return true
}

// filter checks to avoid refetch
function matchesFilters(task) {
  // status
  if (filters.status && task.status !== filters.status) return false
  // type
  if (filters.type && task?.type?.id !== filters.type) return false
  // assignee
  if (filters.assignee && task?.assignee?.id !== filters.assignee) return false
  // creator
  if (filters.creator && task?.created_by?.id !== filters.creator) return false
  // search by project name
  if (searchQuery.value) {
    const q = searchQuery.value.trim().toLowerCase()
    const title = (task?.job_title || '').toLowerCase()
    if (!title.includes(q)) return false
  }
  // date range
  if (Array.isArray(filters.dateRange) && filters.dateRange[0] && filters.dateRange[1]) {
    const start = filters.dateRange[0].startOf('day')
    const end = filters.dateRange[1].endOf('day')
    const created = moment(task?.created_at)
    if (!created.isBetween(start, end, undefined, '[]')) return false
  }
  return true
}

function upsertOrRemoveFromList(task) {
  const idx = tasks.value.findIndex(t => t.id === task.id)
  const keep = matchesCurrentTab(task) && matchesFilters(task)

  if (!keep) {
    if (idx !== -1) tasks.value.splice(idx, 1)
    return
  }

  if (idx === -1) {
    // add new to top
    tasks.value.unshift(task)
  } else {
    // shallow update existing
    tasks.value[idx] = { ...tasks.value[idx], ...task }
  }
}

function subscribeRoleChannel() {
  // only if page is the right place
  if (!shouldListenHere.value) return

  // avoid duplicate subs
  if (roleChannel.value) return

  const token = localStorage.getItem('auth_token') || ''
  console.log('token from dsh')
  echoRoleRef.value = makeEcho(token)
  console.log('echo from dsh', echoRoleRef.value)

  // subscribe to private-roles.{uiLeadRoleId}
  roleChannel.value = echoRoleRef.value.private(`roles.${auth.user.role_id}`)
  console.log('from dsh', roleChannel.value)

  // handlers: backend broadcastAs('task.created'|'task.updated'|'task.deleted'), payload { task: {...} }
  roleChannel.value
    .listen('.task.created', (payload) => {
      const task = payload?.task
      console.log(payload)
      if (!task) return
      upsertOrRemoveFromList(task)
    })
}

function subscribeUserChannel() {
  if (!shouldListenHereUi.value) return
  if (userChannel.value) return

  const token = localStorage.getItem('auth_token') || ''
  echoUserRef.value = makeEcho(token)

  // per-user private channel
  userChannel.value = echoUserRef.value.private(`users.${auth.user.id}`)
  console.log('listen user channel.')

  // receive task payloads sent to the assignee
  userChannel.value
    .listen('.task.assign', (payload) => {
      const task = payload?.task
      console.log(payload)
      if (task) upsertOrRemoveFromList(task)
    })
}

function teardownRoleChannel() {
  try {
    if (echoRoleRef.value && roleChannel.value) {
      echoRoleRef.value.leave(`roles.${auth.user.role_id}`)
    }
    echoRoleRef.value?.disconnect?.()
  } catch (e) {
    console.warn('role channel teardown:', e)
  } finally {
    roleChannel.value = null
    echoRoleRef.value = null
  }
}

function teardownUserChannel() {
  try {
    if (echoUserRef.value && userChannel.value) {
      echoUserRef.value.leave(`users.${auth.user.id}`)
    }
    echoUserRef.value?.disconnect?.()
  } catch (e) {
    console.warn('user channel teardown:', e)
  } finally {
    userChannel.value = null
    echoUserRef.value = null
  }
}

// subscribe (or not) on mount based on current tab + role
onMounted(() => {
  // ...your existing init...
  if (shouldListenHere.value) subscribeRoleChannel()
  if (shouldListenHereUi.value) subscribeUserChannel()
})

// re-evaluate when tab changes
watch(() => currentTab.value?.value, () => {
  if (shouldListenHere.value) {
    subscribeRoleChannel()
  } else {
    teardownRoleChannel()
  }

  if (shouldListenHereUi.value) subscribeUserChannel()
  else teardownUserChannel()
})

// if role could change dynamically, also watch isUiLead
watch(isUiLead, (v) => {
  if (v && shouldListenHere.value) subscribeRoleChannel()
  else teardownRoleChannel()
})

watch(isUi, (v) => {
  if (v && shouldListenHereUi.value) subscribeUserChannel()
  else teardownUserChannel()
})

// cleanup on leave
onBeforeUnmount(() => {
  teardownRoleChannel()
  teardownUserChannel()
})
// socket end

// Init
onMounted(() => {
  tabs.value = getAvailableTabs();
  activeTab.value = tabs.value[0]?.value || '';
  fetchTasks();
  getTaskTypeList();
  getUserNameList();
  fetchWebsitelist();
  getCreatorNameList();
  hasCreatePermission.value = auth.hasPermission('task_create');
  hasViewPermission.value = auth.hasPermission('task_read');
  hasAssignPermission.value = auth.hasPermission('task_assign');
  hasDeletePermission.value = auth.hasPermission('task_delete');
  hasReviewPermission.value = auth.hasPermission('task_review');
  hasCancelPermission.value = auth.hasPermission('task_cancel');
  hasEditPermission.value = auth.hasPermission('task_edit');
})
</script>
