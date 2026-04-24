import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', '..', 'data', 'sofia-guide.db')
const db = new Database(dbPath)

try {
  console.log('🗑️  Cleaning up all user sessions...')
  const deleteStmt = db.prepare('DELETE FROM user_sessions')
  const result = deleteStmt.run()
  console.log(`✅ Deleted ${result.changes} user sessions`)

  console.log('')
  console.log('🦧 Creating admin account...')

  const adminEmoji = '🦧'
  const adminRecoveryCode = '8688'
  const adminSessionId = randomUUID()

  const insertStmt = db.prepare(`
    INSERT INTO user_sessions (session_id, emoji, recovery_code, role)
    VALUES (?, ?, ?, 'admin')
  `)

  insertStmt.run(adminSessionId, adminEmoji, adminRecoveryCode)

  console.log('')
  console.log('✅ Admin account created successfully!')
  console.log('')
  console.log('Admin Details:')
  console.log('  Emoji:        🦧')
  console.log('  Recovery Code: 8688')
  console.log('  Role:         admin')
  console.log('  Session ID:   ', adminSessionId)
  console.log('')
  console.log('🎮 You can now use the app with the admin account!')
  console.log('💡 Other players can create their own emojis in the app.')

} catch (error) {
  console.error('❌ Error:', error)
  process.exit(1)
} finally {
  db.close()
}
