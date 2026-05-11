# Graph Report - .  (2026-05-11)

## Corpus Check
- 100 files · ~60,290 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 324 nodes · 599 edges · 19 communities (18 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `getDatabase()` - 31 edges
2. `initializeDatabase()` - 14 edges
3. `buildRestApp()` - 12 edges
4. `expandRecurrence()` - 8 edges
5. `BottomSheet()` - 8 edges
6. `createTestDbEnv()` - 8 edges
7. `seedDatabase()` - 7 edges
8. `Location` - 7 edges
9. `TestDbEnv` - 7 edges
10. `getEvents()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `createTestDbEnv()` --calls--> `initializeDatabase()`  [EXTRACTED]
  tests/helpers/testDb.ts → server/db/index.ts
- `buildRestApp()` --calls--> `createCategory()`  [EXTRACTED]
  tests/helpers/testApp.ts → server/routes/categories.ts
- `buildRestApp()` --calls--> `createLocation()`  [EXTRACTED]
  tests/helpers/testApp.ts → server/routes/locations.ts
- `buildRestApp()` --calls--> `deleteLocation()`  [EXTRACTED]
  tests/helpers/testApp.ts → server/routes/locations.ts
- `buildRestApp()` --calls--> `createEvent()`  [EXTRACTED]
  tests/helpers/testApp.ts → server/routes/events.ts

## Communities (19 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (29): GpsServer, startGpsServer(), createCategoryViaApi(), createSessionViaApi(), TestSession, createTestDbEnv(), openTestDb(), TestDbEnv (+21 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (32): getDatabase(), buildRestApp(), createCategory(), getCategories(), createEvent(), deleteEvent(), createLocation(), deleteLocation() (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (19): EmojiPickerModal(), EmojiPickerModalProps, Tab, TabNavigationProps, WelcomeOverlayProps, Note, useNotes(), useSession() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (21): CategoryFormProps, PRESET_COLORS, PRESET_ICONS, FilterBarProps, FloatingDockProps, LocationFormProps, HOTEL_COORDS, LocationPanelProps (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (28): hasAnyDetails(), hasBasicInfo(), hasKneipenFields(), hasNightlifeFields(), hasRestaurantFields(), hasSightFields(), parseJSON(), BasicInfoRenderer() (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (24): events, EventType, SeedEvent, defaultDbPath, __dirname, ensureAdminAccount(), __filename, initializeDatabase() (+16 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (20): addDays(), EventOccurrence, EventRow, expandMany(), expandRecurrence(), formatIsoDate(), isoWeekday(), parseIsoDate() (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (7): MapProps, UserLocation, createCategoryIcon(), createCustomIcon(), createWCIcon(), HOTEL_COORDS, SOFIA_CENTER

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (12): EventCard(), EventCardProps, formatTime(), EventOccurrence, useEvents(), EVENT_TYPE_EMOJI, EVENT_TYPE_LABEL, EventType (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (7): adminSessionId, db, dbPath, __dirname, existingAdmin, insertStmt, sessions

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (7): adminSessionId, db, dbPath, deleteStmt, __dirname, insertStmt, result

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): columnNames, columnsToAdd, db, dbPath, __dirname, schema

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (4): db, dbPath, __dirname, locations

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (4): db, dbPath, __dirname, locations

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (4): db, dbPath, __dirname, sessions

## Knowledge Gaps
- **112 isolated node(s):** `__dirname`, `app`, `httpServer`, `io`, `db` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDatabase()` connect `Community 1` to `Community 0`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `initializeDatabase()` connect `Community 5` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `__dirname`, `app`, `httpServer` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._