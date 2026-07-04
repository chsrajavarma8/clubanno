import { Router } from 'express'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Session } from '../models/Session.js'
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js'
import { toIdentity } from '../utils/identity.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authRouter = Router()

const GENERIC_LOGIN_ERROR = 'Invalid username or password.'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: GENERIC_LOGIN_ERROR })
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() })
  if (!user) return res.status(401).json({ error: GENERIC_LOGIN_ERROR })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: GENERIC_LOGIN_ERROR })

  if (user.role === 'club' && user.status === 'pending') {
    return res.status(403).json({ error: `${user.name} is still awaiting admin approval.` })
  }

  const token = crypto.randomBytes(32).toString('hex')
  await Session.create({ token, userId: user._id })

  res.json({ token, identity: toIdentity(user) })
}))

authRouter.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  await Session.deleteOne({ token: req.token })
  res.status(204).end()
}))

authRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ identity: toIdentity(req.user) })
}))

// Admin-only: create a new club account. clubId is generated here (not
// trusted from the client) and returned so the frontend can use it locally
// (e.g. as post.clubId) right after creation.
authRouter.post('/clubs', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { name, description, category, icon, username, password } = req.body || {}
  if (!name || !description || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  const uname = username.trim().toLowerCase()
  if (!EMAIL_RE.test(uname)) {
    return res.status(400).json({ error: 'Enter a valid college email address (e.g. clubname@college.edu).' })
  }
  const existing = await User.findOne({ username: uname })
  if (existing) return res.status(409).json({ error: 'That email is already registered to a club. Use another.' })

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password should be at least 6 characters.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const clubId = `c-${crypto.randomBytes(6).toString('hex')}`

  const user = await User.create({
    username: uname,
    passwordHash,
    role: 'club',
    clubId,
    name,
    description,
    category,
    icon,
    status: 'active',
    customEmojiUrl: null,
  })

  const identity = toIdentity(user)
  res.status(201).json({
    club: {
      id: identity.clubId,
      name: identity.name,
      icon: identity.icon,
      description: identity.description,
      category: identity.category,
      status: identity.status,
      username: identity.username,
      customEmoji: identity.customEmoji,
    },
  })
}))
