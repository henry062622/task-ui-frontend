self.addEventListener('push', (event) => {
  // Check if there is data in the event.
  // The `event.data` object provides methods to parse the payload (e.g., text(), json(), blob()).
  if (event.data) {
    let payload
    let title = 'New Notification'
    let body = 'You have a new message.'
    let icon = '/task_management_logo.png'
    let badge = '/img/icons/icon-72x72.png'
    let url = '/'

    try {
      // First, log the raw text to see if anything is being sent at all.
      const rawText = event.data.text()
      console.log('Raw push payload text:', rawText)

      // Then, try to parse it as JSON.
      payload = JSON.parse(rawText)

      // If parsing is successful, use the data to construct the notification.
      if (payload) {
        title = payload.title || title
        body = payload.body || body
        icon = payload.icon || icon
        badge = payload.badge || badge
        url = payload.data.url || url
      }

      console.log('Parsed push payload:', payload)
    } catch (e) {
      console.error('Failed to parse push payload as JSON:', e)
      // Fallback to a default message if parsing fails.
    }

    // Prepare the notification options using the (now-parsed or default) data.
    const options = {
      body: body,
      icon: icon,
      badge: badge,
      data: {
        // You can attach additional data that will be available when the user clicks the notification.
        url: url,
      },
    }

    // The `event.waitUntil()` method ensures the service worker remains active until
    // the promise inside it (in this case, showing the notification) is resolved.
    event.waitUntil(self.registration.showNotification(title, options))
  } else {
    // Handle cases where the push event has no payload.
    console.log('Push received with no data.')
    const title = 'New Notification'
    const options = {
      body: 'You have a new message.',
      icon: '/img/icons/icon-192x192.png',
    }
    event.waitUntil(self.registration.showNotification(title, options))
  }
})

// Listen for the 'notificationclick' event. This happens when the user clicks on the notification.
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked!')

  // Close the notification.
  event.notification.close()

  // The `event.waitUntil()` method is used here to wait for the window to be opened.
  event.waitUntil(
    // We check if a URL was provided in the notification payload.
    // If so, we open that URL. Otherwise, we open the root URL.
    clients.openWindow(event.notification.data.url),
  )
})
