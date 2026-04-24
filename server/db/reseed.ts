import { seedDatabase } from './seed'
import { initializeDatabase } from './index'

console.log('Initializing database schema...')
initializeDatabase()

console.log('Force re-seeding database with new location details...')
seedDatabase(true)
console.log('Done!')