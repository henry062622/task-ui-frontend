export const STATUS_PENDING = 'pending'
export const STATUS_IN_PROGRESS = 'in-progress'
export const STATUS_WAITING_FOR_REVIEW = 'waiting-for-review'
export const STATUS_NEEDS_REVISION = 'needs-revision'
export const STATUS_COMPLETE = 'complete'
export const STATUS_CANCEL = 'cancel'

export const STATUSES = {
  [STATUS_PENDING]: 'Pending',
  [STATUS_IN_PROGRESS]: 'In Progress',
  [STATUS_WAITING_FOR_REVIEW]: 'Waiting for Review',
  [STATUS_NEEDS_REVISION]: 'Needs Revision',
  [STATUS_COMPLETE]: 'Complete',
  [STATUS_CANCEL]: 'Cancel',
}

export function getStatusLabel(statusKey) {
  return STATUSES[statusKey] || statusKey
}

// Helper to get only specific statuses (example: revision + complete)
export function getRevisionAndCompleteStatuses() {
  return {
    [STATUS_NEEDS_REVISION]: STATUSES[STATUS_NEEDS_REVISION],
    [STATUS_COMPLETE]: STATUSES[STATUS_COMPLETE],
  }
}
