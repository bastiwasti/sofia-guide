import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', '..', 'data', 'sofia-guide.db')
const db = new Database(dbPath)

try {
  const locations = db.prepare(`
    SELECT id, name, category_id, meta, address, opening_hours, website_url, phone,
           beer_menu, cocktails_menu, food_menu, local_specialties,
           music_type, crowd_type, pro_tips, fun_facts, seating_options,
           entry_fee, visit_duration, best_time_to_visit, photo_allowed, guided_tours, key_features, dress_code, service_times
    FROM locations
    LIMIT 5
  `).all()

  console.log('📍 Sample Locations from DB:')
  console.log('')

  locations.forEach((loc: any, i: number) => {
    console.log(`${i + 1}. ${loc.name} (Category ${loc.category_id})`)
    console.log('   Has Data:')
    console.log('     - Basic Info:', !!(loc.address || loc.opening_hours || loc.website_url || loc.phone))
    console.log('     - Food/Kneipen:', !!(loc.beer_menu || loc.cocktails_menu || loc.food_menu || loc.music_type || loc.crowd_type || loc.pro_tips))
    console.log('     - Sight:', !!(loc.entry_fee || loc.visit_duration || loc.key_features))
    console.log('     - Nightlife:', !!(loc.dress_code || loc.service_times))
    console.log('   Raw Data:')
    console.log('     - address:', loc.address)
    console.log('     - beer_menu:', loc.beer_menu ? `${loc.beer_menu.substring(0, 50)}...` : 'null')
    console.log('     - entry_fee:', loc.entry_fee)
    console.log('')
  })

} catch (error) {
  console.error('❌ Error:', error)
} finally {
  db.close()
}
