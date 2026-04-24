import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', '..', 'data', 'sofia-guide.db')
const db = new Database(dbPath)

try {
  const adminEmoji = '🦧'

  console.log('🔍 Checking if admin account exists...')
  const existingAdmin = db.prepare('SELECT * FROM user_sessions WHERE emoji = ?').get(adminEmoji)

  if (existingAdmin) {
    console.log('✅ Admin account already exists:', adminEmoji)
    console.log('   Session ID:', (existingAdmin as any).session_id)
  } else {
    console.log('🦧 Creating admin account...')

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
    console.log('  Emoji:         🦧')
    console.log('  Recovery Code: 8688')
    console.log('  Role:          admin')
    console.log('  Session ID:   ', adminSessionId)
  }

  console.log('')
  console.log('🎮 All user sessions:')
  const sessions = db.prepare('SELECT emoji, role FROM user_sessions').all()
  sessions.forEach((s: any) => {
    console.log(`  ${s.emoji} (${s.role})`)
  })

} catch (error) {
  console.error('❌ Error:', error)
  process.exit(1)
} finally {
  db.close()
}
