import { Router } from 'express'
import { User } from '../models/User.js'
import { Post } from '../models/Post.js'
import { Session } from '../models/Session.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const clubsRouter = Router()

// Club identity/profile data lives in the same `users` collection used for
// login (role: 'club') — no separate clubs collection needed.
function toClubJSON(user) {
  return {
    id: user.clubId,
    name: user.name,
    icon: user.icon,
    description: user.description,
    category: user.category,
    status: user.status,
    customEmoji: user.customEmojiUrl,
    username: user.username,
  }
}

clubsRouter.get('/', asyncHandler(async (req, res) => {
  const clubs = await User.find({ role: 'club' })
  const postCounts = await Post.aggregate([{ $group: { _id: '$clubId', count: { $sum: 1 } } }])
  const countByClubId = Object.fromEntries(postCounts.map((p) => [p._id, p.count]))
  res.json({ clubs: clubs.map((c) => ({ ...toClubJSON(c), postCount: countByClubId[c.clubId] || 0 })) })
}))

// Admin-only: permanently removes a club — its login, its posts, and any
// active sessions. There's no one left to notify (the account is gone), so
// this doesn't create a system notification the way post actions do.
clubsRouter.post('/:clubId/delete', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { clubId } = req.params
  const user = await User.findOne({ clubId, role: 'club' })
  if (!user) return res.status(404).json({ error: 'Club not found.' })

  await Post.deleteMany({ clubId })
  await Session.deleteMany({ userId: user._id })
  await User.deleteOne({ _id: user._id })

  res.json({ ok: true, id: clubId })
}))

// A club can update its own custom emoji; an admin can update anyone's.
clubsRouter.post('/:clubId/emoji', requireAuth, asyncHandler(async (req, res) => {
  const { clubId } = req.params
  const { customEmojiUrl } = req.body || {}

  if (req.user.role !== 'admin' && req.user.clubId !== clubId) {
    return res.status(403).json({ error: 'You can only update your own club.' })
  }

  const user = await User.findOne({ clubId, role: 'club' })
  if (!user) return res.status(404).json({ error: 'Club not found.' })

  user.customEmojiUrl = customEmojiUrl || null
  await user.save()

  res.json({ club: toClubJSON(user) })
}))
