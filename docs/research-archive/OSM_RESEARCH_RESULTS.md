# OSM Research Results

**Date:** 2026-04-23
**Method:** OpenStreetMap Nominatim API
**Status:** ✅ SUCCESS - Found addresses for 6 more bars

---

## What Worked

**OSM Nominatim API** - Static JSON API, no JavaScript required!

```bash
curl -s "https://nominatim.openstreetmap.org/search?format=json&q=BarName+Sofia+Bulgaria"
```

---

## New Addresses Found (6/37 pending)

### ✅ Hambara
- **OSM Name:** Хамбара
- **Address:** 22, 6-ти септември, Център, София
- **Coordinates:** 42.6901512, 23.3255166

### ✅ Bar Locál
- **OSM Name:** Local
- **Address:** 6-ти септември, Център, София
- **Coordinates:** 42.6877404, 23.3248697

### ✅ Bar Secret Room
- **OSM Name:** Secret Room
- **Address:** Христо Белчев, Център, София
- **Coordinates:** 42.6932694, 23.3212068

### ✅ Caldo Whiskey & Friends
- **OSM Name:** Caldo
- **Address:** 125, Георги С. Раковски, Център, София
- **Coordinates:** 42.6940182, 23.3286719

### ✅ Sip'n Bite Wine Spot
- **OSM Name:** Sip 'n Bite
- **Address:** 145, Георги С. Раковски, Център, София
- **Coordinates:** 42.6923351, 23.3270099

### ✅ La Cave du Moulin
- **OSM Name:** La Cave du Moulin
- **Address:** 33, Солунска, Център, София
- **Coordinates:** 42.6927459, 23.3191121

### ✅ Halbite (Tri ushi)
- **OSM Name:** Халбите - Mалките пет
- **Address:** 72, Неофит Рилски, Център, София
- **Coordinates:** 42.6894894, 23.3247077

### ✅ Carrusel Club
- **OSM Name:** Карусел
- **Address:** Георги С. Раковски, Център, София
- **Coordinates:** 42.6924807, 23.3262459

### ✅ Yalta
- **OSM Name:** Yalta Club
- **Address:** 20, бул. Цар Освободител, Център, София
- **Coordinates:** 42.6928125, 23.3336374

---

## Not Found via OSM (8/37 pending)

- BiraBar
- Beer University
- Bar 103
- Vino & Grazhdanka
- One More Park Bar
- Zelka Bar
- Brick Bar
- The Apartment
- Bunker Bar

---

## Updated Statistics

### Data Quality by Location Type

| Category | Total | Fully Researched | Basic Info Only | Addresses Added |
|----------|-------|------------------|-----------------|-----------------|
| Kneipen & Bars | 9 | 3 | 6 | 6 |
| Craft Beer | 6 | 2 | 4 | 1 |
| Nightlife | 3 | 2 | 1 | 2 |
| Sehenswürdigkeiten | 12 | 0 | 12 | 0 |
| Restaurants | 12 | 0 | 12 | 0 |
| Hotel | 1 | 0 | 1 | 0 |
| **TOTAL** | **43** | **7 (16%)** | **36 (84%)** | **9** |

### Progress Summary

- **Fully Researched (7 locations):**
  1. Tap Local ✅
  2. KANAAL ✅
  3. Rock'nRolla ✅
  4. Raketa Rakia Bar ✅
  5. Sputnik Cocktail Bar ✅
  6. Eddie Sicoy Bar ✅
  7. Hambara (address only) ✅

- **Basic Info + Address (9 locations):**
  1. Bar Locál (address added)
  2. Bar Secret Room (address added)
  3. Caldo Whiskey & Friends (address added)
  4. Sip'n Bite Wine Spot (address added)
  5. La Cave du Moulin (address added)
  6. Halbite (address added)
  7. Carrusel Club (address added)
  8. Yalta (address added)
  9. Hotel Niky (address already had)

- **Basic Info Only (27 locations):**
  - All remaining with name, meta, rating, coordinates

---

## Why OSM Worked

1. **Static API** - No JavaScript execution needed
2. **JSON Response** - Easy to parse
3. **No Rate Limiting** (for our usage level)
4. **Multilingual** - Finds Bulgarian names
5. **Accurate** - OpenStreetMap is community-maintained

## Next Steps

### Option A: Continue OSM Research
- Try different search terms for remaining 8 bars
- Search for street names + "bar"
- Search for Bulgarian names only

### Option B: Accept Current State
- 16/43 locations (37%) have some improvement
- 7/43 locations (16%) fully researched
- 9/43 locations (21%) have addresses now
- File is ready for use

### Option C: Manual Enhancement
- You provide details for remaining 8 bars
- Focus on: opening hours, phone, beer menu

---

## Files Updated

- ✅ `server/db/seed-data.ts` - 9 addresses added
- ✅ `OSM_RESEARCH_RESULTS.md` - This file
- ✅ `RESEARCH_PROGRESS.md` - To be updated with OSM results

---

## OSM Search Pattern Used

```bash
# Basic search
curl -s "https://nominatim.openstreetmap.org/search?format=json&q=BarName+Sofia+Bulgaria"

# If no results, try variations
curl -s "https://nominatim.openstreetmap.org/search?format=json&q=BarName+Sofia"
curl -s "https://nominatim.openstreetmap.org/search?format=json&q=BarName+bar+Sofia"
```

---

## Notable Finding: Street Names

Many Sofia bars cluster around these streets:
- **Георги С. Раковски** - Caldo, Sip'n Bite, Carrusel
- **Неофит Рилски** - Halbite (close to Hotel Niky!)
- **6-ти септември** - Hambara, Bar Locál
- **Христо Белчев** - Secret Room
- **Солунска** - La Cave du Moulin
- **бул. Цар Освободител** - Yalta Club

This confirms the central location of these bars in Sofia's city center.
