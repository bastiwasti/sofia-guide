import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

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
  } catch (error) {
    console.log('Locations migration completed or not needed')
  }
}

export function initializeDatabase(): void {
  const db = getDatabase()

  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
    db.exec(schema)
    console.log('Database schema initialized successfully')

    migrateNotesTable(db)
    migrateLocationsTable(db)
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    db.close()
  }
}
