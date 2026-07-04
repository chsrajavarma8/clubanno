import mongoose from 'mongoose'

let connected = false

export async function connectDB(uri) {
  if (connected) return mongoose.connection
  if (!uri) throw new Error('MONGODB_URI is not set. Copy server/.env.example to server/.env and fill it in.')

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  connected = true
  console.log(`✓ Connected to MongoDB (${mongoose.connection.name})`)
  return mongoose.connection
}
