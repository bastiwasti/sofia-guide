-- Migration: Add detailed fields for Kneipen (and other locations)
-- Date: 2026-04-23
-- All fields are optional (NULL) to support partial data

-- Practical Info
ALTER TABLE locations ADD COLUMN website_url TEXT;
ALTER TABLE locations ADD COLUMN address TEXT;
ALTER TABLE locations ADD COLUMN opening_hours TEXT;
ALTER TABLE locations ADD COLUMN payment_methods TEXT;

-- Menu Highlights (JSON)
ALTER TABLE locations ADD COLUMN beer_menu TEXT;
ALTER TABLE locations ADD COLUMN cocktails_menu TEXT;
ALTER TABLE locations ADD COLUMN food_menu TEXT;
ALTER TABLE locations ADD COLUMN local_specialties TEXT;

-- Fun & Vibe Info
ALTER TABLE locations ADD COLUMN music_type TEXT;
ALTER TABLE locations ADD COLUMN crowd_type TEXT;
ALTER TABLE locations ADD COLUMN pro_tips TEXT;
ALTER TABLE locations ADD COLUMN fun_facts TEXT;
ALTER TABLE locations ADD COLUMN seating_options TEXT;
