import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', '..', 'data', 'sofia-guide.db')
const db = new Database(dbPath)

const columnsToAdd = [
  { name: 'phone', sql: 'TEXT' },
  { name: 'entry_fee', sql: 'TEXT' },
  { name: 'visit_duration', sql: 'TEXT' },
  { name: 'best_time_to_visit', sql: 'TEXT' },
  { name: 'photo_allowed', sql: 'TEXT' },
  { name: 'guided_tours', sql: 'TEXT' },
  { name: 'key_features', sql: 'TEXT' },
  { name: 'dress_code', sql: 'TEXT' },
  { name: 'service_times', sql: 'TEXT' }
]

try {
  const schema = db.pragma('table_info(locations)') as Array<{ name: string; type: string }>
  const columnNames = schema.map(col => col.name)

  console.log('Checking and adding missing columns to locations table...\n')

  columnsToAdd.forEach(({ name, sql }) => {
    if (!columnNames.includes(name)) {
      console.log(`✅ Adding column: ${name}`)
      db.exec(`ALTER TABLE locations ADD COLUMN ${name} ${sql}`)
    } else {
      console.log(`ℹ️  Column ${name} already exists, skipping...`)
    }
  })

  console.log('\n🎉 Migration completed successfully!')

} catch (error) {
  console.error('❌ Error:', error)
} finally {
  db.close()
}
