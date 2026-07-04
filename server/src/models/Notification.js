import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  // 'admin' | 'public' | a club's clubId
  audience: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  timestamp: { type: Number, required: true },
  read: { type: Boolean, default: false },
})

export const Notification = mongoose.model('Notification', notificationSchema)
