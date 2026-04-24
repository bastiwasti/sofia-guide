import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { seedDatabase } from './seed'
import { randomUUID } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const defaultDbPath = join(__dirname, '../../data/sofia-guide.db')

function resolveDbPath(): string {
  return process.env.SQLITE_DB_PATH ?? defaultDbPath
}

export function getDatabase(): Database.Database {
  const db = new Database(resolveDbPath())
  db.pragma('journal_mode = WAL')
  return db
}

function migrateNotesTable(db: Database.Database): void {
  try {
    const schema = db.pragma('table_info(notes)') as Array<{ name: string; type: string }>
    const columnNames = schema.map(col => col.name)

    if (!columnNames.includes('session_id')) {
      console.log('Adding session_id column to notes table...')
      db.exec('ALTER TABLE notes ADD COLUMN session_id TEXT')
    }

    if (!columnNames.includes('backup_emoji')) {
      console.log('Adding backup_emoji column to notes table...')
      db.exec('ALTER TABLE notes ADD COLUMN backup_emoji TEXT')
    }

    db.exec('CREATE INDEX IF NOT EXISTS idx_notes_session_id ON notes(session_id)')

    console.log('Clearing old notes for fresh start...')
    db.exec('DELETE FROM notes')

    console.log('Notes table migration completed successfully')
  } catch (error) {
    console.log('Notes migration completed or not needed')
  }
}

function migrateLocationsTable(db: Database.Database): void {
  try {
    const schema = db.pragma('table_info(locations)') as Array<{ name: string; type: string }>
    const columnNames = schema.map(col => col.name)

    if (!columnNames.includes('session_id')) {
      console.log('Adding session_id column to locations table...')
      db.exec('ALTER TABLE locations ADD COLUMN session_id TEXT')
      db.exec('CREATE INDEX IF NOT EXISTS idx_locations_session_id ON locations(session_id)')
      console.log('Locations table migration completed successfully')
    } else {
      console.log('Locations table already has session_id column')
    }

    if (!columnNames.includes('backup_emoji')) {
      console.log('Adding backup_emoji column to locations table...')
      db.exec('ALTER TABLE locations ADD COLUMN backup_emoji TEXT')
      console.log('Locations table backup_emoji migration completed successfully')
    } else {
      console.log('Locations table already has backup_emoji column')
    }

    if (!columnNames.includes('website_url')) {
      console.log('Adding kneipen details columns to locations table...')
      db.exec('ALTER TABLE locations ADD COLUMN website_url TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN address TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN opening_hours TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN payment_methods TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN phone TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN beer_menu TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN cocktails_menu TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN food_menu TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN local_specialties TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN music_type TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN crowd_type TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN pro_tips TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN fun_facts TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN seating_options TEXT')
      console.log('Kneipen details migration completed successfully')
    } else {
      console.log('Locations table already has kneipen details columns')
    }

    if (!columnNames.includes('entry_fee')) {
      console.log('Adding sight details columns to locations table...')
      db.exec('ALTER TABLE locations ADD COLUMN entry_fee TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN visit_duration TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN best_time_to_visit TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN photo_allowed TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN guided_tours TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN key_features TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN dress_code TEXT')
      db.exec('ALTER TABLE locations ADD COLUMN service_times TEXT')
      console.log('Sight details migration completed successfully')
    } else {
      console.log('Locations table already has sight details columns')
    }

    if (!columnNames.includes('description')) {
      console.log('Adding description column to locations table...')
      db.exec('ALTER TABLE locations ADD COLUMN description TEXT')
      console.log('Description column migration completed successfully')
    }
  } catch (error) {
    console.log('Locations migration completed or not needed')
  }
}

function migrateEventsTable(db: Database.Database): void {
  try {
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='events'"
    ).get()

    if (!tableExists) {
      console.log('Creating events table...')
      db.exec(`
        CREATE TABLE events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          event_type TEXT NOT NULL CHECK(event_type IN ('concert','sport','festival','market','theater','opera')),
          location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
          venue_name TEXT,
          venue_address TEXT,
          venue_lat REAL,
          venue_lng REAL,
          start_date TEXT,
          end_date TEXT,
          start_time TEXT,
          end_time TEXT,
          recurrence TEXT,
          recurrence_until TEXT,
          price TEXT,
          external_url TEXT,
          description TEXT,
          emoji TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      db.exec('CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date)')
      db.exec('CREATE INDEX IF NOT EXISTS idx_events_location_id ON events(location_id)')
      console.log('Events table migration completed successfully')
    }
  } catch (error) {
    console.log('Events migration completed or not needed')
  }
}

function migrateUserRoleTable(db: Database.Database): void {
  try {
    const schema = db.pragma('table_info(user_sessions)') as Array<{ name: string }>
    const columnNames = schema.map(col => col.name)

    if (!columnNames.includes('role')) {
      console.log('Adding role column to user_sessions table...')
      db.exec('ALTER TABLE user_sessions ADD COLUMN role TEXT DEFAULT "user"')
      console.log('User sessions role migration completed successfully')
    } else {
      console.log('User sessions already has role column')
    }
  } catch (error) {
    console.log('User sessions role migration completed or not needed')
  }
}

function ensureAdminAccount(db: Database.Database): void {
  const adminEmoji = '🦧'

  const existingAdmin = db.prepare('SELECT * FROM user_sessions WHERE emoji = ?').get(adminEmoji) as any

  if (existingAdmin) {
    console.log(`✅ Admin account already exists: ${adminEmoji}`)
    return
  }

  console.log(`🦧 Creating admin account...`)
  const adminRecoveryCode = '8688'
  const adminSessionId = randomUUID()

  const insertStmt = db.prepare(`
    INSERT INTO user_sessions (session_id, emoji, recovery_code, role)
    VALUES (?, ?, ?, 'admin')
  `)

  insertStmt.run(adminSessionId, adminEmoji, adminRecoveryCode)
  console.log(`✅ Admin account created: ${adminEmoji} (recovery code: ${adminRecoveryCode})`)
}

export function initializeDatabase(): void {
  const db = getDatabase()

  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
    db.exec(schema)
    console.log('Database schema initialized successfully')

    migrateNotesTable(db)
    migrateLocationsTable(db)
    migrateEventsTable(db)
    migrateUserRoleTable(db)

    if (process.env.CLEAR_USER_SESSIONS_ON_START === 'true') {
      console.log('🗑️  CLEAR_USER_SESSIONS_ON_START=true: deleting all user sessions...')
      const deleteStmt = db.prepare('DELETE FROM user_sessions')
      const result = deleteStmt.run()
      console.log(`✅ Deleted ${result.changes} user sessions`)
    }

    ensureAdminAccount(db)
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    db.close()
  }

  seedDatabase()
}
