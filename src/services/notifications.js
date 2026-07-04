import { apiFetch, parseJson } from './api'

export async function fetchNotifications() {
  const res = await apiFetch('/api/notifications')
  const data = await parseJson(res, 'Could not load notifications.')
  return data.notifications
}

// Used for the client-detected "announcement expiring soon" reminder.
export async function createNotification({ audience, title, body }) {
  const res = await apiFetch('/api/notifications', {
    method: 'POST',
    body: JSON.stringify({ audience, title, body }),
  })
  const data = await parseJson(res, 'Could not create notification.')
  return data.notification
}

// audiences: e.g. ['admin'], ['public', clubId], or ['public'] for a guest.
export async function markNotificationsRead(audiences) {
  const res = await apiFetch('/api/notifications/mark-read', {
    method: 'POST',
    body: JSON.stringify({ audiences }),
  })
  return parseJson(res, 'Could not mark notifications read.')
}
