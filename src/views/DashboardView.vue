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
                            :placeholder="$t('search_by_pj_name')" @search="handleSearch" allow-clear
                            style="width: 250px" />

                        <a-select v-if="currentTab?.filters.includes('status')" v-model:value="filters.status"
                            :placeholder="$t('status')" @change="handleFilter" style="width: 110px" allow-clear>
                            <a-select-option value="pending">Pending</a-select-option>
                            <a-select-option value="in-progress">In Progress</a-select-option>
                            <a-select-option value="complete">Completed</a-select-option>
                            <a-select-option value="cancel">Cancelled</a-select-option>
                        </a-select>

                        <a-select v-if="currentTab?.filters.includes('type')" v-model:value="filters.type"
                            :placeholder="$t('type')" @change="handleFilter" allow-clear style="width: 220px">
                            <a-select-option v-for="type in taskTypeList" :key="type.id" :value="type.id"> {{ type.name
                            }} </a-select-option>
                        </a-select>

                        <a-select v-if="currentTab?.filters.includes('assignee')" v-model:value="filters.assignee"
                            :placeholder="$t('assignee')" @change="handleFilter" allow-clear style="width: 180px">
                            <a-select-option v-for="user in userList" :key="user.id" :value="user.id"> {{ user.name
                            }} </a-select-option>
                        </a-select>

                        <a-range-picker v-model:value="filters.dateRange" :placeholder="[t('fromDate'), t('toDate')]"
                            :disabled-date="disabledDate" @calendarChange="onCalendarChange" @change="handleFilter"
                            style="width: 250px" />
                    </div>

                    <!-- Table -->
                    <a-table :columns="columns" :data-source="tasks" :pagination="pagination" :loading="loading"
                        row-key="id" @change="handleTableChange" bordered>
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

                                    <a-button
                                        v-if="currentTab?.buttons.includes('in-progress') && record.status == 'pending'"
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
                                        v-if="currentTab?.buttons.includes('cancel') && (record.status == 'pending' || record.status == 'in-progress')"
                                        danger @click="clickCancelBtn(record.id)">
                                        {{ $t('cancel') }}
                                    </a-button>

                                    <a-button v-if="currentTab?.buttons.includes('assign') && hasAssignPermission"
                                        @click="assignTask(record.id)">
                                        {{ $t('assign') }}
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
        <AssignPopup :visible="showModal" :task-id="selectedTaskId" :user-list="userList" @close="showModal = false"
            @assigned="removeAssignedTaskFromList"></AssignPopup>
        <CompletePopup :visible="showCompleteModel" :task-id="selectedTaskId" @completed="actionAfterStatusUpdate"
            @close="showCompleteModel = false"></CompletePopup>
        <SubmitTaskForReview :visible="showSubmitTaskModel" :task-id="selectedTaskId"
            @submitTask="actionAfterStatusUpdate" @close="showSubmitTaskModel = false"></SubmitTaskForReview>
        <CancelPopup :visible="showCancelModel" :task-id="selectedTaskId" @close="showCancelModel = false"
            @cancelled="actionAfterStatusUpdate"></CancelPopup>
    </DefaultLayout>
</template>
<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue';
import api from '@/lib/axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { computed, h, onMounted, reactive, ref } from 'vue';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import AssignPopup from '@/components/task/AssignPopup.vue';
import CompletePopup from '@/components/task/CompletePopup.vue';
import { formatDate } from '@/utils/format';
import CancelPopup from '@/components/task/CancelPopup.vue';
import { getColor } from '@/utils/initials';
import { useI18n } from 'vue-i18n';
import SubmitTaskForReview from '@/components/task/SubmitTaskForReview.vue';
import { getStatusLabel } from '@/utils/status';
import moment from 'moment'

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
const tasks = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const filters = reactive({ status: null, type: null, assignee: null, dateRange: [] });
const taskTypeList = ref([]);
const userList = ref([]);
const selectedTaskId = ref(null);
const userRoleId = auth.user.role_id;
const uiRoleId = import.meta.env.VITE_UI_ROLE_ID;
const { t } = useI18n();

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
                start_date: filters.dateRange ? filters.dateRange[0]?.format('YYYY-MM-DD') : '',
                end_date: filters.dateRange ? filters.dateRange[1]?.format('YYYY-MM-DD') : '',
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
    removeTaskFromList(task.id);
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
    router.push(`/tasks/${id}`);
};

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
    showModal.value = true;
};

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

const getAvailableTabs = () => {
    const isUi = userRoleId == uiRoleId;

    const allTabs = [
        { value: 'my_tasks', label: 'my_tasks', showSearch: true, filters: ['status', 'type'], buttons: ['see_more', 'in-progress', 'submit', 'cancel'] },
        { value: 'all_tasks', label: 'all_tasks', showSearch: true, filters: ['status', 'type', 'assignee'], buttons: ['see_more', 'delete'] },
        { value: 'in_progress', label: 'in_progress', showSearch: false, filters: [], buttons: ['see_more', 'submit', 'cancel'] },

        // ⬇️ new “waiting for review” tab
        {
            value: 'waiting_for_review',
            label: isUi ? 'submitted_tasks'   // UI sees “Submitted Tasks”
                : 'waiting_for_review', // others see “Waiting for Review”
            showSearch: false,
            filters: ['type'],
            buttons: ['see_more', 'review']
        },

        // ⬇️ new “needs revision” tab
        {
            value: 'needs_revision',
            label: isUi ? 'revisions_required' // UI sees “Revisions Required”
                : 'needs_revision',    // others see “Needs Revision”
            showSearch: false,
            filters: ['type'],
            buttons: ['see_more', 'submit']
        },

        { value: 'complete', label: 'complete', showSearch: true, filters: ['type'], buttons: ['see_more'] },
        { value: 'cancel', label: 'cancel', showSearch: true, filters: ['type'], buttons: ['see_more'] },
        { value: 'task_distribution', label: 'task_distribution', showSearch: false, filters: ['type', 'website'], buttons: ['see_more', 'assign', 'delete'] },
    ];

    // hide “My Tasks” for UI role, hide “Task Distribution” for others
    return isUi
        ? allTabs.filter(t => t.value !== 'task_distribution')
        : allTabs.filter(t => t.value !== 'my_tasks');
}

// Init
onMounted(() => {
    tabs.value = getAvailableTabs();
    activeTab.value = tabs.value[0]?.value || '';
    fetchTasks();
    getTaskTypeList();
    getUserNameList();
    hasCreatePermission.value = auth.hasPermission('task_create');
    hasViewPermission.value = auth.hasPermission('task_read');
    hasAssignPermission.value = auth.hasPermission('task_assign');
    hasDeletePermission.value = auth.hasPermission('task_delete');
    hasReviewPermission.value = auth.hasPermission('task_review');
})
</script>