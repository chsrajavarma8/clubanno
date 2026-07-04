// One-time bootstrap: creates the admin account + the demo clubs (matching
// src/data/seed.js) directly in MongoDB, so the app's existing demo
// usernames/passwords keep working once login goes through the real API.
//
// Usage:
//   cd server
//   cp .env.example .env   # fill in MONGODB_URI
//   npm install
//   npm run seed

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB } from './src/config/db.js'
import { User } from './src/models/User.js'
import { Post } from './src/models/Post.js'

const DAY_MS = 24 * 60 * 60 * 1000
const now = Date.now()

const DEMO_POSTS = [
  {
    clubId: 'c1', type: 'announcement', status: 'approved',
    title: 'Winter Hackathon 2026 — Registrations Open',
    body: '48 hours, 5 tracks, real prizes. Bring a team of up to 4. Kickoff is at 6 PM in the main auditorium.',
    category: 'Hackathon', author: 'Coding Club Committee',
    link: 'https://forms.gle/example-hackathon-signup', poster: null,
    deadlineDays: 15, expiresAt: now - 1000 * 60 * 60 * 5 + 15 * DAY_MS, timestamp: now - 1000 * 60 * 60 * 5,
  },
  {
    clubId: 'c1', type: 'announcement', status: 'approved',
    title: 'Intro to Git Workshop',
    body: 'A hands-on session on branching, PRs, and resolving merge conflicts. No experience needed.',
    category: 'Workshop', author: 'Coding Club Committee',
    link: '', poster: null,
    deadlineDays: 15, expiresAt: now - 1000 * 60 * 60 * 30 + 15 * DAY_MS, timestamp: now - 1000 * 60 * 60 * 30,
  },
  {
    clubId: 'c2', type: 'announcement', status: 'approved',
    title: 'Valorant 5v5 Tournament',
    body: 'Sign-ups close Friday. Bracket goes live Saturday morning.',
    category: 'Games', author: 'Gaming Guild Committee',
    link: 'https://challonge.com/example-bracket', poster: null,
    deadlineDays: 15, expiresAt: now - 1000 * 60 * 60 * 12 + 15 * DAY_MS, timestamp: now - 1000 * 60 * 60 * 12,
  },
  {
    clubId: 'c3', type: 'announcement', status: 'approved',
    title: 'Robotics Tech Talk: Sensors 101',
    body: 'Guest speaker from the Mechatronics dept. covering sensor fusion basics.',
    category: 'Tech Event', author: 'Robotics Club Committee',
    link: '', poster: null,
    deadlineDays: 15, expiresAt: now - 1000 * 60 * 60 * 48 + 15 * DAY_MS, timestamp: now - 1000 * 60 * 60 * 48,
  },
  {
    clubId: 'c2', type: 'promotion', status: 'approved',
    title: 'Behind the scenes at our LAN night',
    body: 'Highlights from last week — full reel is live.',
    author: 'Gaming Guild Committee',
    reelLink: 'https://www.instagram.com/reel/example/', timestamp: now - 1000 * 60 * 60 * 20,
  },
]

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

const DEMO_CLUBS = [
  { clubId: 'c1', name: 'Coding Club', icon: '💻', category: 'Tech Event', description: 'Build things, ship code, learn together.', username: 'codingclub', password: 'coding123' },
  { clubId: 'c2', name: 'Gaming Guild', icon: '🎮', category: 'Games', description: 'Casual and competitive gaming for everyone.', username: 'gamingguild', password: 'gaming123' },
  { clubId: 'c3', name: 'Robotics Club', icon: '🤖', category: 'Tech Event', description: 'Design, build, and race robots.', username: 'roboticsclub', password: 'robotics123' },
  { clubId: 'c4', name: 'Photography Club', icon: '📷', category: 'Cultural', description: 'Shoot, edit, and critique together.', username: 'photoclub', password: 'photo123' },
  { clubId: 'c5', name: 'Drama Society', icon: '🎭', category: 'Cultural', description: 'Plays, skits, and stage events.', username: 'dramasociety', password: 'drama123' },
]

async function upsertUser({ username, password, ...rest }) {
  const passwordHash = await bcrypt.hash(password, 10)
  const existing = await User.findOne({ username })
  if (existing) {
    Object.assign(existing, rest, { passwordHash })
    await existing.save()
    return { username, action: 'updated' }
  }
  await User.create({ username, passwordHash, ...rest })
  return { username, action: 'created' }
}

async function main() {
  await connectDB(process.env.MONGODB_URI)

  const admin = await upsertUser({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD, role: 'admin', status: 'active' })
  console.log(`✓ Admin ${admin.action}: ${admin.username} / ${ADMIN_PASSWORD}`)

  for (const club of DEMO_CLUBS) {
    const { password, ...rest } = club
    const result = await upsertUser({ ...rest, password, role: 'club', status: 'active', customEmojiUrl: null })
    console.log(`✓ Club ${result.action}: ${result.username} / ${password}`)
  }

  const existingPostCount = await Post.countDocuments({})
  if (existingPostCount === 0) {
    await Post.insertMany(DEMO_POSTS)
    console.log(`✓ Seeded ${DEMO_POSTS.length} demo posts.`)
  } else {
    console.log(`- Skipped demo posts (${existingPostCount} already exist).`)
  }

  console.log('Done. These match the demo accounts already shown in the app\'s login screen.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
