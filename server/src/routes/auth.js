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
const DOB_RE = /^\d{4}-\d{2}-\d{2}$/ // 'YYYY-MM-DD', matches an <input type="date"> value

// Re-verifies email+DOB against the database. Used by both forgot-password
// steps so the actual match check only lives in one place.
async function findUserByEmailAndDob(email, dob) {
  const uname = (email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(uname) || !DOB_RE.test(dob || '')) return null
  const user = await User.findOne({ username: uname, role: 'user' })
  if (!user || !user.dob || user.dob !== dob) return null
  return user
}

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

// Public self-service signup for regular ("user") accounts — separate from
// admin/club accounts, which only an admin can create. Logs the new account
// in immediately, same as a normal login, so there's no separate "user login"
// flow to build: /login already works for any role.
authRouter.post('/signup', asyncHandler(async (req, res) => {
  const { email, dob, password } = req.body || {}
  if (!email || !dob || !password) {
    return res.status(400).json({ error: 'Email, date of birth, and password are all required.' })
  }

  const uname = email.trim().toLowerCase()
  if (!EMAIL_RE.test(uname)) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (!DOB_RE.test(dob)) {
    return res.status(400).json({ error: 'Enter a valid date of birth.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password should be at least 6 characters.' })
  }

  const existing = await User.findOne({ username: uname })
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username: uname, passwordHash, role: 'user', dob, status: 'active' })

  const token = crypto.randomBytes(32).toString('hex')
  await Session.create({ token, userId: user._id })

  res.status(201).json({ token, identity: toIdentity(user) })
}))

// Step 1 of the DOB-gated password reset: only confirms the email + date of
// birth match a "user" account. Doesn't reveal anything else, and doesn't
// change the password yet — the frontend only unlocks the "new password"
// field after this returns ok.
authRouter.post('/forgot-password/verify', asyncHandler(async (req, res) => {
  const { email, dob } = req.body || {}
  const user = await findUserByEmailAndDob(email, dob)
  if (!user) return res.status(401).json({ error: 'Email and date of birth do not match our records.' })
  res.json({ ok: true })
}))

// Step 2: re-verifies email + DOB server-side (never trusts that step 1
// already happened) before actually changing the password.
authRouter.post('/forgot-password/reset', asyncHandler(async (req, res) => {
  const { email, dob, newPassword } = req.body || {}
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password should be at least 6 characters.' })
  }
  const user = await findUserByEmailAndDob(email, dob)
  if (!user) return res.status(401).json({ error: 'Email and date of birth do not match our records.' })

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  await user.save()
  // Log out any existing sessions for this account so the old password
  // can't keep being used anywhere it was already logged in.
  await Session.deleteMany({ userId: user._id })

  res.json({ ok: true })
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
