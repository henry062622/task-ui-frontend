export function formatPermissionName(permission) {
  if (!permission) return ''

  return permission
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(date))
}

export function formatDateTime(input, withTime = true, tz) {
  if (!input) return '—'

  let d
  if (typeof input === 'string') {
    const s = input.trim()

    // If the server sends "YYYY-MM-DD HH:mm:ss" (no timezone),
    // treat it as UTC by appending 'Z'. If yours is LOCAL, remove the '+ "Z"' below.
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s) && !/[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) {
      d = new Date(s.replace(' ', 'T') + 'Z') // normalize & assume UTC
    } else {
      // ISO strings with 'Z' or an offset are handled correctly by Date()
      d = new Date(s)
    }
  } else {
    d = new Date(input)
  }

  if (isNaN(d.getTime())) return '—'

  // Language from your localStorage flag
  const lang = (localStorage.getItem('lang') || 'en').toLowerCase().startsWith('th') ? 'th-TH' : 'en-US'

  // Force USER local timezone (browser/OS), unless an explicit tz is passed in
  const timeZone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone

  const base = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone
  }

  const opts = withTime
    ? { ...base, hour: '2-digit', minute: '2-digit', second: '2-digit' } // 24h/12h follows locale
    : base

  return new Intl.DateTimeFormat(lang, opts).format(d)
}
