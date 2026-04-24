import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', '..', 'data', 'sofia-guide.db')
const db = new Database(dbPath)

try {
  const locations = db.prepare(`
    SELECT id, name, category_id, meta, rating, price_range
    FROM locations
    LIMIT 10
  `).all()

  console.log('📍 Sample Locations (meta, rating, price_range):')
  console.log('')

  locations.forEach((loc: any, i: number) => {
    console.log(`${i + 1}. ${loc.name} (Category ${loc.category_id})`)
    console.log('   Meta:', loc.meta ? `"${loc.meta.substring(0, 100)}${loc.meta.length > 100 ? '...' : ''}"` : 'null')
    console.log('   Rating:', loc.rating)
    console.log('   Price Range:', loc.price_range)
    console.log('')
  })

} catch (error) {
  console.error('❌ Error:', error)
} finally {
  db.close()
}
