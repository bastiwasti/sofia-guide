# Graph Report - /home/sebastian/projects/sofia-guide  (2026-05-04)

## Corpus Check
- 100 files · ~60,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 200 nodes · 296 edges · 36 communities (32 shown, 4 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b870b1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Routes & Server (29)|Routes & Server (29)]]
- [[_COMMUNITY_Tests & Helpers (19)|Tests & Helpers (19)]]
- [[_COMMUNITY_Components & Lib (16)|Components & Lib (16)]]
- [[_COMMUNITY_Components & Lib (15)|Components & Lib (15)]]
- [[_COMMUNITY_Bottomsheet & Src (15)|Bottomsheet & Src (15)]]
- [[_COMMUNITY_Db & Server (14)|Db & Server (14)]]
- [[_COMMUNITY_Src & Hooks (14)|Src & Hooks (14)]]
- [[_COMMUNITY_Lib & Server (10)|Lib & Server (10)]]
- [[_COMMUNITY_Src & Hooks (10)|Src & Hooks (10)]]
- [[_COMMUNITY_Components & Src (8)|Components & Src (8)]]
- [[_COMMUNITY_Pages & Src (7)|Pages & Src (7)]]
- [[_COMMUNITY_Pages & Src (6)|Pages & Src (6)]]
- [[_COMMUNITY_Scripts (3)|Scripts (3)]]
- [[_COMMUNITY_Scripts (3)|Scripts (3)]]

## God Nodes (most connected - your core abstractions)
1. `getDatabase()` - 28 edges
2. `initializeDatabase()` - 13 edges
3. `buildRestApp()` - 12 edges
4. `expandRecurrence()` - 8 edges
5. `createTestDbEnv()` - 8 edges
6. `seedDatabase()` - 7 edges
7. `getEvents()` - 6 edges
8. `expandMany()` - 5 edges
9. `createCategory()` - 5 edges
10. `createEvent()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmit()` --calls--> `createNote()`  [INFERRED]
  src/pages/NotesPage.tsx → server/routes/notes.ts
- `handleDelete()` --calls--> `deleteNote()`  [INFERRED]
  src/pages/NotesPage.tsx → server/routes/notes.ts
- `createTestDbEnv()` --calls--> `initializeDatabase()`  [INFERRED]
  tests/helpers/testDb.ts → server/db/index.ts
- `buildRestApp()` --calls--> `createCategory()`  [INFERRED]
  tests/helpers/testApp.ts → server/routes/categories.ts
- `buildRestApp()` --calls--> `createEvent()`  [INFERRED]
  tests/helpers/testApp.ts → server/routes/events.ts

## Communities (36 total, 4 thin omitted)

### Community 0 - "Routes & Server (29)"
Cohesion: 0.2
Nodes (21): getDatabase(), createCategory(), getCategories(), createEvent(), deleteEvent(), getEvents(), isValidIsoDate(), createLocation() (+13 more)

### Community 1 - "Tests & Helpers (19)"
Cohesion: 0.18
Nodes (7): startGpsServer(), createCategoryViaApi(), createSessionViaApi(), buildRestApp(), createTestDbEnv(), openTestDb(), registerSocketHandlers()

### Community 2 - "Components & Lib (16)"
Cohesion: 0.16
Nodes (7): canSave(), disabledReason(), handleCreateNew(), handleRecover(), validateCode(), useUserSessions(), ApiError

### Community 3 - "Components & Lib (15)"
Cohesion: 0.17
Nodes (5): calculateDistance(), createCategoryIcon(), createCustomIcon(), createWCIcon(), formatDistance()

### Community 4 - "Bottomsheet & Src (15)"
Cohesion: 0.21
Nodes (10): hasAnyDetails(), hasBasicInfo(), hasKneipenFields(), hasNightlifeFields(), hasRestaurantFields(), hasSightFields(), parseJSON(), BasicInfoRenderer() (+2 more)

### Community 5 - "Db & Server (14)"
Cohesion: 0.25
Nodes (10): ensureAdminAccount(), initializeDatabase(), migrateEventsTable(), migrateEventVenueLookups(), migrateLocationsTable(), migrateNotesTable(), migrateUserRoleTable(), resolveDbPath() (+2 more)

### Community 6 - "Src & Hooks (14)"
Cohesion: 0.19
Nodes (6): useCategories(), useEvents(), useLocations(), getSocket(), useUserLocations(), MapPage()

### Community 7 - "Lib & Server (10)"
Cohesion: 0.36
Nodes (7): addDays(), expandMany(), expandRecurrence(), formatIsoDate(), isoWeekday(), parseIsoDate(), parseWeeklyRecurrence()

### Community 9 - "Components & Src (8)"
Cohesion: 0.36
Nodes (4): handleClose(), handleEscape(), handleGetStarted(), handleOverlayClick()

### Community 10 - "Pages & Src (7)"
Cohesion: 0.29
Nodes (3): useNotes(), handleDelete(), handleSubmit()

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDatabase()` connect `Routes & Server (29)` to `Db & Server (14)`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `buildRestApp()` connect `Tests & Helpers (19)` to `Routes & Server (29)`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `expandMany()` connect `Lib & Server (10)` to `Routes & Server (29)`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `getDatabase()` (e.g. with `seedDatabase()` and `getCategories()`) actually correct?**
  _`getDatabase()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `initializeDatabase()` (e.g. with `seedDatabase()` and `createTestDbEnv()`) actually correct?**
  _`initializeDatabase()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `buildRestApp()` (e.g. with `createLocation()` and `deleteLocation()`) actually correct?**
  _`buildRestApp()` has 5 INFERRED edges - model-reasoned connections that need verification._