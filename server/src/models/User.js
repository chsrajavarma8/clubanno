import mongoose from 'mongoose'

// A "user" is either the single admin account or a club account. This
// collection is the source of truth for who can log in and their identity
// (name/icon/description/category/status) — everything else in the app
// (posts, reactions, notifications) stays outside MongoDB for now.
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'club', 'user'], required: true },

  // Club-only fields. `clubId` is the id used throughout the frontend
  // (matches post.clubId etc.) — for admin users this stays null.
  clubId: { type: String, default: null },
  name: { type: String, default: null },
  icon: { type: String, default: null },
  description: { type: String, default: null },
  category: { type: String, default: null },
  status: { type: String, enum: ['active', 'pending'], default: 'active' },
  customEmojiUrl: { type: String, default: null },

  // Regular ("user") accounts only — self-service signups. Stored as a
  // plain 'YYYY-MM-DD' string so forgot-password can do an exact match
  // without timezone/Date-object comparison headaches.
  dob: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.model('User', userSchema)
