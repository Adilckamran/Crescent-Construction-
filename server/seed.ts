import dotenv from 'dotenv'
dotenv.config()
import { db } from './db'

async function seed() {
  console.log('Database seeding initiated...')
  await db.ensureAdminAccount()
  await db.ensureInitialData()
  console.log('Database seeded successfully.')
  console.log('Stats:', await db.getStats())
}

seed().catch(err => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
