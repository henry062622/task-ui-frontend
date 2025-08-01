export const STATUS_PENDING = 'pending'
export const STATUS_IN_PROGRESS = 'in-progress'
export const STATUS_WAITING_FOR_REVIEW = 'waiting-for-review'
export const STATUS_NEEDS_REVISION = 'needs-revision'
export const STATUS_COMPLETE = 'complete'
export const STATUS_CANCEL = 'cancel'

export function getStatuses(userRoleId, uiRoleId) {
  const statuses = {
    [STATUS_PENDING]: 'รอดำเนินการ/Pending',
    [STATUS_IN_PROGRESS]: 'กำลังดำเนินการ/In Progress',
    [STATUS_WAITING_FOR_REVIEW]: 'รอตรวจสอบ/Waiting for Review',
    [STATUS_NEEDS_REVISION]: 'ต้องแก้ไข/Needs Revision',
    [STATUS_COMPLETE]: 'เสร็จสิ้น/Complete',
    [STATUS_CANCEL]: 'ยกเลิก/Cancel',
  }
  if (userRoleId == uiRoleId) {
    statuses[STATUS_WAITING_FOR_REVIEW] = 'ส่งแล้ว/Submitted'
    statuses[STATUS_NEEDS_REVISION] = 'รอการแก้ไข/Revisions Required'
  }
  return statuses
}

export function getStatusLabel(statusKey, userRoleId, uiRoleId) {
  const statuses = getStatuses(userRoleId, uiRoleId)
  return statuses[statusKey] || statusKey
}

// Helper to get only specific statuses (example: revision + complete)
export function getRevisionAndCompleteStatuses() {
  return {
    [STATUS_NEEDS_REVISION]: STATUSES[STATUS_NEEDS_REVISION],
    [STATUS_COMPLETE]: STATUSES[STATUS_COMPLETE],
  }
}
