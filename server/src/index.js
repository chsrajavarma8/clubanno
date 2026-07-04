import 'dotenv/config'
import { createApp } from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 4000

async function main() {
  await connectDB(process.env.MONGODB_URI)
  const app = createApp()
  app.listen(PORT, () => console.log(`✓ Auth API listening on http://localhost:${PORT}`))
}

main().catch((err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})
