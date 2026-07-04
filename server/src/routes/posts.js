import { Router } from 'express'
import { Post } from '../models/Post.js'
import { User } from '../models/User.js'
import { Notification } from '../models/Notification.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const postsRouter = Router()

const MAX_DEADLINE_DAYS = 15
const DAY_MS = 24 * 60 * 60 * 1000

function toPostJSON(post) {
  return {
    id: post._id.toString(),
    clubId: post.clubId,
    type: post.type,
    status: post.status,
    title: post.title,
    body: post.body,
    category: post.category,
    author: post.author,
    link: post.link,
    poster: post.poster,
    posterType: post.posterType,
    reelLink: post.reelLink,
    deadlineDays: post.deadlineDays,
    expiresAt: post.expiresAt,
    timestamp: post.timestamp,
    reactions: post.reactions || {},
  }
}

// Public — matches the original app's behavior where post visibility (e.g.
// hiding pending posts from non-admins) was only ever enforced client-side.
postsRouter.get('/', asyncHandler(async (req, res) => {
  const posts = await Post.find({})
  res.json({ posts: posts.map(toPostJSON) })
}))

postsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
  if (req.user.role !== 'club') return res.status(403).json({ error: 'Only clubs can submit posts.' })

  const { type, title, body, category, link, poster, posterType, reelLink, deadlineDays } = req.body || {}
  if (!type || !title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  const timestamp = Date.now()
  const doc = {
    clubId: req.user.clubId,
    type,
    status: 'pending',
    title: title.trim(),
    body: body.trim(),
    author: `${req.user.name} Committee`,
    timestamp,
    link: link || '',
    category: type === 'announcement' ? category || null : null,
    poster: type === 'announcement' ? poster || null : null,
    posterType: type === 'announcement' ? posterType || null : null,
    reelLink: type === 'promotion' ? reelLink || null : null,
  }

  if (type === 'announcement') {
    const days = Math.min(Math.max(Number(deadlineDays) || MAX_DEADLINE_DAYS, 1), MAX_DEADLINE_DAYS)
    doc.deadlineDays = days
    doc.expiresAt = timestamp + days * DAY_MS
  }

  const post = await Post.create(doc)

  await Notification.create({
    audience: 'admin',
    title: 'New post pending review',
    body: `${req.user.name} submitted "${doc.title}" (${type}).`,
    timestamp: Date.now(),
  })

  res.status(201).json({ post: toPostJSON(post) })
}))

postsRouter.post('/:id/approve', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ error: 'Post not found.' })

  post.status = 'approved'
  await post.save()

  const club = await User.findOne({ clubId: post.clubId, role: 'club' })
  const clubName = club?.name || 'A club'

  await Notification.insertMany([
    { audience: 'public', title: `New ${post.type} from ${clubName}`, body: post.title, timestamp: Date.now() },
    { audience: post.clubId, title: 'Your post was approved', body: post.title, timestamp: Date.now() },
  ])

  res.json({ post: toPostJSON(post) })
}))

postsRouter.post('/:id/reject', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ error: 'Post not found.' })

  await Post.deleteOne({ _id: post._id })

  await Notification.create({
    audience: post.clubId,
    title: 'Your post was rejected',
    body: post.title,
    timestamp: Date.now(),
  })

  res.json({ ok: true, id: post._id.toString() })
}))

// A club can delete their own post (pending or already-live); an admin can
// delete any post. Notifies whichever side didn't do the deleting, so there's
// always a record of who removed what.
postsRouter.post('/:id/delete', requireAuth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ error: 'Post not found.' })

  const isOwner = req.user.role === 'club' && req.user.clubId === post.clubId
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'You can only delete your own posts.' })
  }

  await Post.deleteOne({ _id: post._id })

  if (isOwner) {
    await Notification.create({
      audience: 'admin',
      title: 'Post removed',
      body: `${req.user.name} removed "${post.title}".`,
      timestamp: Date.now(),
    })
  } else {
    await Notification.create({
      audience: post.clubId,
      title: 'Your post was removed',
      body: `An admin removed "${post.title}".`,
      timestamp: Date.now(),
    })
  }

  res.json({ ok: true, id: post._id.toString() })
}))

// Public and unauthenticated on purpose — matches the original app, where
// anyone viewing a post (including guests) could react to it.
postsRouter.post('/:id/react', asyncHandler(async (req, res) => {
  const { emoji } = req.body || {}
  if (!emoji) return res.status(400).json({ error: 'Missing emoji.' })

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { [`reactions.${emoji}`]: 1 } },
    { new: true }
  )
  if (!post) return res.status(404).json({ error: 'Post not found.' })

  res.json({ post: toPostJSON(post) })
}))
