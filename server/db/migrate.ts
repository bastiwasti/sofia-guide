import { initializeDatabase } from './index'
import { seedDatabase } from './seed'
import { mkdirSync } from 'fs'
import { join } from 'path'

const dataDir = join(process.cwd(), 'data')

try {
  mkdirSync(dataDir, { recursive: true })
  initializeDatabase()
  seedDatabase()
  console.log('Migration completed successfully')
  process.exit(0)
} catch (error) {
  console.error('Migration failed:', error)
  process.exit(1)
}
