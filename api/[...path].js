// Vercel serverless entry point. Any request to /api/* lands here (catch-all
// route) and is handed to the same Express app used for local dev, so
// /api/auth/login, /api/auth/logout, /api/auth/me, and /api/auth/clubs all
// keep working exactly as they do locally — no route changes needed.
//
// Login state lives in MongoDB (the `sessions` collection), not in server
// memory, so this works fine across separate serverless invocations: logging
// out on one request correctly ends the session even if a later request is
// handled by a completely different function instance.
import { createApp } from '../server/src/app.js'
import { connectDB } from '../server/src/config/db.js'

// Cache the in-flight setup promise (not just the result) at module scope.
// Vercel reuses this module across requests on a warm instance, so this
// avoids reconnecting to MongoDB on every request, and avoids opening
// duplicate connections if several requests hit a cold instance at once.
let appPromise

function getApp() {
  if (!appPromise) {
    appPromise = connectDB(process.env.MONGODB_URI)
      .then(() => createApp())
      .catch((err) => {
        appPromise = null // let the next request retry instead of caching a failure
        throw err
      })
  }
  return appPromise
}

export default async function handler(req, res) {
  const app = await getApp()
  app(req, res)
}
