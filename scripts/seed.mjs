// One-time bootstrap script — run with the Firebase Admin SDK, NOT from the browser.
// It creates the first admin account (there's no public "sign up as admin" in the app
// on purpose) and, optionally, a few demo clubs + posts so you have something to look
// at right away.
//
// Usage:
//   1. Firebase console > Project settings > Service accounts > Generate new private key.
//      Save it as serviceAccountKey.json in this project's root (already gitignored).
//   2. GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
//        ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=changeme123 \
//        SEED_DEMO_DATA=true \
//        npm run seed

import { readFileSync } from 'node:fs'
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SEED_DEMO_DATA = process.env.SEED_DEMO_DATA === 'true'
const CLUB_AUTH_DOMAIN = process.env.VITE_CLUB_AUTH_DOMAIN || 'communityhub.local'

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables before running this script.')
  process.exit(1)
}

function loadCredential() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (keyPath) {
    const json = JSON.parse(readFileSync(keyPath, 'utf8'))
    return cert(json)
  }
  // Falls back to Application Default Credentials (e.g. `gcloud auth application-default login`).
  return applicationDefault()
}

initializeApp({ credential: loadCredential() })
const auth = getAuth()
const db = getFirestore()

async function upsertAuthUser(email, password) {
  try {
    return await auth.getUserByEmail(email)
  } catch {
    return auth.createUser({ email, password, emailVerified: true })
  }
}

async function main() {
  const adminUser = await upsertAuthUser(ADMIN_EMAIL, ADMIN_PASSWORD)
  await db.collection('admins').doc(adminUser.uid).set({
    email: ADMIN_EMAIL,
    createdAt: FieldValue.serverTimestamp(),
  })
  console.log(`✓ Admin ready: ${ADMIN_EMAIL} (uid ${adminUser.uid})`)

  if (!SEED_DEMO_DATA) {
    console.log('Skipping demo clubs/posts (set SEED_DEMO_DATA=true to include them).')
    return
  }

  const demoClubs = [
    { username: 'codingclub', password: 'coding123', name: 'Coding Club', icon: '💻', category: 'Tech Event', description: 'Build things, ship code, learn together.' },
    { username: 'gamingguild', password: 'gaming123', name: 'Gaming Guild', icon: '🎮', category: 'Games', description: 'Casual and competitive gaming for everyone.' },
  ]

  for (const club of demoClubs) {
    const email = `${club.username}@${CLUB_AUTH_DOMAIN}`
    const user = await upsertAuthUser(email, club.password)
    await db.collection('clubs').doc(user.uid).set({
      name: club.name,
      description: club.description,
      category: club.category,
      icon: club.icon,
      username: club.username,
      status: 'active',
      customEmojiUrl: null,
      createdAt: FieldValue.serverTimestamp(),
    })
    console.log(`✓ Demo club ready: ${club.name} (login: ${club.username} / ${club.password})`)
  }

  console.log('Demo data seeded. Log in from the app to try posting — new posts still need admin approval.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
