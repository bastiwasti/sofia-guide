-- Migration: Add events table for the Sofia trip weekend section
-- Date: 2026-04-23
-- Supports one-off events, recurring weekly events, and events tied to existing locations or standalone venues

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

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_location_id ON events(location_id);
