import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import Database from 'better-sqlite3'
import { initializeDatabase } from '../../server/db/index'

export interface TestDbEnv {
  dbPath: string
  cleanup: () => void
}

export function createTestDbEnv(): TestDbEnv {
  const dir = mkdtempSync(join(tmpdir(), 'sofia-test-'))
  const dbPath = join(dir, 'test.db')
  process.env.SQLITE_DB_PATH = dbPath
  initializeDatabase()
  return {
    dbPath,
    cleanup: () => {
      delete process.env.SQLITE_DB_PATH
      rmSync(dir, { recursive: true, force: true })
    },
  }
}

export function openTestDb(dbPath: string): Database.Database {
  return new Database(dbPath)
}
