export function formatPermissionName(permission) {
  if (!permission) return ''

  return permission
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
