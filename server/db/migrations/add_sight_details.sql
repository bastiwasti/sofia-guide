-- Migration: Add detailed fields for Sehenswürdigkeiten (and re-usable for museums)
-- Date: 2026-04-23
-- All fields are optional (NULL) to support partial data

-- Universal sight info
ALTER TABLE locations ADD COLUMN entry_fee TEXT;
ALTER TABLE locations ADD COLUMN visit_duration TEXT;
ALTER TABLE locations ADD COLUMN best_time_to_visit TEXT;
ALTER TABLE locations ADD COLUMN photo_allowed TEXT;
ALTER TABLE locations ADD COLUMN guided_tours TEXT;

-- Key features (JSON array of {name, note})
ALTER TABLE locations ADD COLUMN key_features TEXT;

-- Religious-site specific
ALTER TABLE locations ADD COLUMN dress_code TEXT;
ALTER TABLE locations ADD COLUMN service_times TEXT;
