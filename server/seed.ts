import dotenv from 'dotenv'
dotenv.config()
import { db } from './db'

console.log('Database seeding initiated...')
db.ensureAdminAccount()
db.ensureInitialData()
console.log('Database seeded successfully.')
console.log('Stats:', db.getStats())
