import { Session } from '../models/Session.js'
import { User } from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function getToken(req) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  return scheme === 'Bearer' ? token : null
}

// Verifies the bearer token against the Sessions collection in MongoDB and
// attaches the matching user to req.user. Used by /me, /logout, and any
// admin-only route.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = getToken(req)
  if (!token) return res.status(401).json({ error: 'Not authenticated.' })

  const session = await Session.findOne({ token })
  if (!session) return res.status(401).json({ error: 'Session expired. Please log in again.' })

  const user = await User.findById(session.userId)
  if (!user) {
    await Session.deleteOne({ token })
    return res.status(401).json({ error: 'Session expired. Please log in again.' })
  }

  req.user = user
  req.token = token
  next()
})

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' })
  next()
}
