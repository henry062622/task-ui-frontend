export const getInitials = (fullName) => {
  if (!fullName) return ''

  const names = fullName.trim().split(' ')

  if (names.length === 0) return ''
  if (names.length === 1) return names[0].charAt(0).toUpperCase()

  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
}

export const getColor = (status) => {
  if (status == 'complete') {
    return '#87d068'
  } else if (status == 'in-progress') {
    return '#faad14'
  } else if (status == 'cancel') {
    return '#f50'
  } else {
    return '#faad14'
  }
}
