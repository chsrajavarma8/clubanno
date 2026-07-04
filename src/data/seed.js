export const CATEGORIES = [
  'Tech Event',
  'Hackathon',
  'Workshop',
  'Games',
  'Sports',
  'Cultural',
  'General',
]

export const CLUB_ICONS = ['💻', '🎮', '📷', '🤖', '🎭', '🎨', '⚽', '🎵', '📚', '🚀']

export const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' }

// Matches server/seed.js — used only to show hints on the login screen for
// the built-in demo accounts. Real passwords (including for clubs created
// via the Admin Panel) are hashed server-side and can't be displayed here.
export const DEMO_CREDENTIALS = {
  admin: 'admin123',
  codingclub: 'coding123',
  gamingguild: 'gaming123',
  roboticsclub: 'robotics123',
  photoclub: 'photo123',
  dramasociety: 'drama123',
}

export const DEFAULT_DEADLINE_DAYS = 15
export const MAX_DEADLINE_DAYS = 15

export const MAX_POSTER_BYTES = 20 * 1024 * 1024 // 20 MB

export const POSTER_TYPES = [
  { id: 'small', label: 'Small / Flyer', inches: '11 × 17 in', width: 3300, height: 5100, usage: 'Bulletin boards, events' },
  { id: 'medium', label: 'Medium', inches: '18 × 24 in', width: 5400, height: 7200, usage: 'Advertising, home decor' },
  { id: 'large', label: 'Large', inches: '24 × 36 in', width: 7200, height: 10800, usage: 'Retail displays, statement pieces' },
]
export const MAX_EMOJI_BYTES = 100 * 1024 // 100 KB

export const DEFAULT_REACTIONS = ['👍', '🎉']

const DAY_MS = 24 * 60 * 60 * 1000

export const initialClubs = [
  { id: 'c1', name: 'Coding Club', icon: '💻', status: 'active', description: 'Build things, ship code, learn together.', username: 'codingclub', password: 'coding123', customEmoji: null },
  { id: 'c2', name: 'Gaming Guild', icon: '🎮', status: 'active', description: 'Casual and competitive gaming for everyone.', username: 'gamingguild', password: 'gaming123', customEmoji: null },
  { id: 'c3', name: 'Robotics Club', icon: '🤖', status: 'active', description: 'Design, build, and race robots.', username: 'roboticsclub', password: 'robotics123', customEmoji: null },
  { id: 'c4', name: 'Photography Club', icon: '📷', status: 'active', description: 'Shoot, edit, and critique together.', username: 'photoclub', password: 'photo123', customEmoji: null },
  { id: 'c5', name: 'Drama Society', icon: '🎭', status: 'active', description: 'Plays, skits, and stage events.', username: 'dramasociety', password: 'drama123', customEmoji: null },
]

const now = Date.now()

export const initialPosts = [
  {
    id: 'a1',
    clubId: 'c1',
    type: 'announcement',
    status: 'approved',
    title: 'Winter Hackathon 2026 — Registrations Open',
    body: '48 hours, 5 tracks, real prizes. Bring a team of up to 4. Kickoff is at 6 PM in the main auditorium.',
    category: 'Hackathon',
    author: 'Coding Club Committee',
    link: 'https://forms.gle/example-hackathon-signup',
    poster: null,
    deadlineDays: 15,
    expiresAt: now - 1000 * 60 * 60 * 5 + 15 * DAY_MS,
    timestamp: now - 1000 * 60 * 60 * 5,
  },
  {
    id: 'a2',
    clubId: 'c1',
    type: 'announcement',
    status: 'approved',
    title: 'Intro to Git Workshop',
    body: 'A hands-on session on branching, PRs, and resolving merge conflicts. No experience needed.',
    category: 'Workshop',
    author: 'Coding Club Committee',
    link: '',
    poster: null,
    deadlineDays: 15,
    expiresAt: now - 1000 * 60 * 60 * 30 + 15 * DAY_MS,
    timestamp: now - 1000 * 60 * 60 * 30,
  },
  {
    id: 'a3',
    clubId: 'c2',
    type: 'announcement',
    status: 'approved',
    title: 'Valorant 5v5 Tournament',
    body: 'Sign-ups close Friday. Bracket goes live Saturday morning.',
    category: 'Games',
    author: 'Gaming Guild Committee',
    link: 'https://challonge.com/example-bracket',
    poster: null,
    deadlineDays: 15,
    expiresAt: now - 1000 * 60 * 60 * 12 + 15 * DAY_MS,
    timestamp: now - 1000 * 60 * 60 * 12,
  },
  {
    id: 'a4',
    clubId: 'c3',
    type: 'announcement',
    status: 'approved',
    title: 'Robotics Tech Talk: Sensors 101',
    body: 'Guest speaker from the Mechatronics dept. covering sensor fusion basics.',
    category: 'Tech Event',
    author: 'Robotics Club Committee',
    link: '',
    poster: null,
    deadlineDays: 15,
    expiresAt: now - 1000 * 60 * 60 * 48 + 15 * DAY_MS,
    timestamp: now - 1000 * 60 * 60 * 48,
  },
  {
    id: 'p1',
    clubId: 'c2',
    type: 'promotion',
    status: 'approved',
    title: 'Behind the scenes at our LAN night',
    body: 'Highlights from last week — full reel is live.',
    author: 'Gaming Guild Committee',
    reelLink: 'https://www.instagram.com/reel/example/',
    timestamp: now - 1000 * 60 * 60 * 20,
  },
]
