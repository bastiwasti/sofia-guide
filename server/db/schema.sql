-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  meta TEXT,
  rating REAL,
  price_range TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  session_id TEXT,
  backup_emoji TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  session_id TEXT,
  backup_emoji TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES user_sessions(session_id)
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL UNIQUE,
  recovery_code TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User locations table (for real-time location sharing)
CREATE TABLE IF NOT EXISTS user_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  accuracy REAL,
  is_tracking INTEGER DEFAULT 0,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
);

-- Events table (concerts, sport, festivals, theater/opera for the trip weekend)
CREATE TABLE IF NOT EXISTS events (
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
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_category_id ON locations(category_id);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_emoji ON user_sessions(emoji);
CREATE INDEX IF NOT EXISTS idx_user_locations_session_id ON user_locations(session_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_last_seen ON user_locations(last_seen);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_location_id ON events(location_id);
