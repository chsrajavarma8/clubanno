import mongoose from 'mongoose'

// A logged-in session, keyed by an opaque token handed to the client.
// Logging out deletes the row here — that's the whole point of sessions
// living in MongoDB instead of using stateless JWTs.
const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' }, // auto-expire after 7 days
})

export const Session = mongoose.model('Session', sessionSchema)
