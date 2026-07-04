import { Router } from 'express'
import { Notification } from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const notificationsRouter = Router()

function toNotificationJSON(n) {
  return {
    id: n._id.toString(),
    audience: n.audience,
    title: n.title,
    body: n.body,
    timestamp: n.timestamp,
    read: n.read,
  }
}

// Public — the frontend filters which notifications to show per viewer,
// same as when this was all client-side state. No per-user server-side
// enforcement here, matching the rest of this app's security model.
notificationsRouter.get('/', asyncHandler(async (req, res) => {
  const notifications = await Notification.find({})
  res.json({ notifications: notifications.map(toNotificationJSON) })
}))

// Unauthenticated on purpose — used by the client's "announcement expiring
// soon" reminder, which any viewer's browser can detect just by having the
// posts loaded (same as before this was backed by a real database).
notificationsRouter.post('/', asyncHandler(async (req, res) => {
  const { audience, title, body } = req.body || {}
  if (!audience || !title || !body) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }
  const n = await Notification.create({ audience, title, body, timestamp: Date.now() })
  res.status(201).json({ notification: toNotificationJSON(n) })
}))

// Body: { audiences: string[] } — e.g. a club marks ['public', their clubId]
// read at once when they open the bell; an admin marks ['admin'].
notificationsRouter.post('/mark-read', asyncHandler(async (req, res) => {
  const { audiences } = req.body || {}
  if (!Array.isArray(audiences) || audiences.length === 0) {
    return res.status(400).json({ error: 'Missing audiences.' })
  }
  await Notification.updateMany({ audience: { $in: audiences } }, { $set: { read: true } })
  res.json({ ok: true })
}))
