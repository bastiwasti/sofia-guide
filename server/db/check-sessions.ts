import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', '..', 'data', 'sofia-guide.db')
const db = new Database(dbPath)

try {
  const sessions = db.prepare('SELECT emoji, role, session_id FROM user_sessions').all()

  console.log('📋 User Sessions:')
  console.log('')
  sessions.forEach((s: any, i: number) => {
    const isAdmin = s.role === 'admin' ? '👑 ADMIN' : '  USER'
    console.log(`${i + 1}. ${s.emoji} - ${isAdmin}`)
    console.log(`   Session ID: ${s.session_id}`)
    console.log('')
  })

  if (sessions.length === 0) {
    console.log('❌ No user sessions found!')
  } else {
    console.log(`✅ Total: ${sessions.length} user session(s)`)
  }

} catch (error) {
  console.error('❌ Error:', error)
} finally {
  db.close()
}
