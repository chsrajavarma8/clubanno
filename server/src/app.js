import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { clubsRouter } from './routes/clubs.js'
import { postsRouter } from './routes/posts.js'
import { notificationsRouter } from './routes/notifications.js'

export function createApp() {
  const app = express()

  // Reflects whatever origin the request comes from unless CLIENT_ORIGIN is
  // explicitly set to lock it down (e.g. for a production deployment). This
  // avoids breaking local dev when Vite picks a different port than expected.
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }))
  // Poster images are small data URLs but can still be a few MB, so raise
  // the default 100kb JSON body limit.
  app.use(express.json({ limit: '25mb' }))

  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.use('/api/auth', authRouter)
  app.use('/api/clubs', clubsRouter)
  app.use('/api/posts', postsRouter)
  app.use('/api/notifications', notificationsRouter)

  // Fallback error handler so a thrown/rejected async route doesn't hang the
  // request. Includes the real error message (e.g. a MongoDB error) so it's
  // visible in the browser instead of a generic, undebuggable message.
  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: err.message || 'Something went wrong.' })
  })

  return app
}
