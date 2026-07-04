import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  clubId: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'promotion'], required: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, default: null }, // announcements only
  author: { type: String, required: true },
  link: { type: String, default: '' },
  poster: { type: String, default: null }, // data URL
  posterType: { type: String, default: null },
  reelLink: { type: String, default: null }, // promotions only
  deadlineDays: { type: Number, default: null },
  expiresAt: { type: Number, default: null }, // ms epoch
  timestamp: { type: Number, required: true }, // ms epoch
  // Arbitrary emoji -> count map (e.g. { '👍': 3, custom: 1 }).
  reactions: { type: mongoose.Schema.Types.Mixed, default: {} },
})

export const Post = mongoose.model('Post', postSchema)
