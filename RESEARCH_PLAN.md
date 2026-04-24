# Kneipen Research Plan

**Date:** 2026-04-23
**Goal:** Add detailed information to all 23 kneipen (bars) in Sofia Guide
**Status:** Planning Phase Complete → Research Phase Started

---

## Kneipen List (23 locations)

1. ✅ Tap Local - **TEST LOCATION**
2. KANAAL
3. BiraBar
4. The Hop Bar
5. Brick Bar
6. Sputnik Cocktail Bar
7. Bar Locál
8. Bar Secret Room
9. Fabric 123
10. Bar 103
11. Eddie Sicoy Bar
12. Raketa Rakia Bar
13. Caldo Whiskey & Friends
14. Sip'n Bite Wine Spot
15. La Cave du Moulin
16. Hambara
17. Rock'nRolla
18. One More Park Bar
19. Cheveremetza 10
20. Vino & Grazhdanka
21. Beer University
22. Halbite (Tri ushi)
23. Halbite Beer Hall
24. Zelka Bar
25. The Apartment
26. Bunker Bar

---

## Information Sources (Priority Order)

### Primary Sources (High success rate)
- Instagram/Facebook pages (bars often active here)
- Google Maps reviews/photos (address, hours, payment)
- TripAdvisor (menu mentions, photos)
- Foursquare/Yelp (beer lists, hours)

### Secondary Sources (Lower success rate)
- Official websites (many small bars don't have one)
- Local blogs/articles (Sofia bar guides)
- Beer enthusiast forums (for craft beer bars)
- TikTok/YouTube (vibe, crowd info)

### Fallback for missing data
- Use meta field as baseline (we have this already!)
- Leave NULL (completely acceptable)

---

## Research Template Per Location

### High Priority (Must Find)
```
1. Website URL
   - Instagram handle (@barname)
   - Facebook page (no Instagram)
   - Google Maps link (fallback)

2. Address
   - Street name + number
   - District/area (optional)
   - Source: Google Maps

3. Opening Hours
   - Regular days vs weekends
   - Holiday closures
   - Source: Google Maps or social media bio
```

### Medium Priority (Try to Find)
```
4. Beer Menu (Top 3-5 items)
   - Beer names, breweries, prices
   - Source: Instagram posts, Google reviews, photos
   - Format: JSON array with expand option

5. Payment Methods
   - Cash? Card? Revolut?
   - Source: Google reviews ("takes Revolut")
   - Basic set: ["cash", "card", "revolut"]

6. Music Type
   - Source: Instagram stories, reviews
   - Examples: "Jazz, Rock, Electronic, Chalga"

7. Crowd Type
   - Source: Reviews, age group mentions
   - Examples: "Locals, Tourists, Students, Mixed"

8. Seating Options
   - Indoor? Terrace? Garden?
   - Source: Instagram photos, Google Maps street view
```

### Low Priority (Nice to Have)
```
9. Pro Tips
   - Insider knowledge from reviews
   - "Secret menu", "best time to go"

10. Fun Facts
    - Historical tidbits
    - "Oldest bar", "named after..."

11. Cocktails Menu (if cocktail bar)
    - 2-3 signature drinks

12. Food Menu
    - Meze, snacks (if available)
```

---

## Research Workflow - Step by Step

### Step 1: Preparation
- Create research spreadsheet/template
- List all 23 locations
- Set up browser tabs for efficient searching

### Step 2: Per Location Research (15-20 min/location)
```
2a. Quick Google Search (1 min)
- "BarName Sofia Bulgaria"
- "BarName Instagram"
- "BarName Facebook"

2b. Check Social Media (5-8 min)
- Instagram: Bio has hours, website, phone
- Posts: Beer photos, menu shots, crowd
- Stories: Vibe, music
- No Instagram? Try Facebook

2c. Google Maps (2-3 min)
- Pin location → verify address
- Check "Popular Times" → infer crowd
- Read reviews → payment methods
- View photos → seating options

2d. TripAdvisor/Yelp (2-3 min)
- Menu photos
- "Must try" mentions
- Review snippets

2e. Fill Template (2 min)
- Copy URLs
- Format hours
- JSON-ify beer list
- Note what's missing
```

### Step 3: Quality Check
- Address coordinates match our lat/lng?
- Opening hours current (not outdated)?
- Beer prices in € (BGN)?
- URL is accessible?

### Step 4: Mark Completeness
- ✅ Complete: All high + medium priority
- ⚠️ Partial: High priority only
- ❌ Missing: Bare minimum (name + meta)

---

## Research Sessions

### Session 1: Test Run (30-40 min) ✅ IN PROGRESS
**Location: Tap Local** (well-documented craft beer bar)
- Validate workflow
- Test JSON formatting
- Identify challenges
- Adjust template if needed

**Goal:** Get comfortable with research process

### Session 2: Craft Beer Focused (2-3 hours)
**Locations (5):**
- KANAAL
- BiraBar
- The Hop Bar
- Brick Bar

**Why these first:**
- Beer menu is primary focus
- Strong online presence likely
- High data completeness expected

### Session 3: Cocktail Bars (1.5-2 hours)
**Locations (6):**
- Sputnik Cocktail Bar
- Bar Locál
- Bar Secret Room
- Fabric 123
- Bar 103
- Eddie Sicoy Bar

**Why these second:**
- Cocktails menu priority
- Often have active Instagram
- Good for variety

### Session 4: Specialized Bars (1.5-2 hours)
**Locations (4):**
- Raketa Rakia Bar
- Caldo Whiskey & Friends
- Sip'n Bite Wine Spot
- La Cave du Moulin

**Why these third:**
- Specialized menus (rakia, whiskey, wine)
- Unique research patterns

### Session 5: Casual Bars (1.5-2 hours)
**Locations (5):**
- Hambara
- Rock'nRolla
- One More Park Bar
- Cheveremetza 10
- Vino & Grazhdanka

**Why these fourth:**
- Mixed focus (beer + cocktails + vibe)
- May have less online presence

### Session 6: Remaining (1-1.5 hours)
**Locations (5):**
- Beer University
- Halbite (Tri ushi)
- Halbite Beer Hall
- Zelka Bar
- The Apartment
- Bunker Bar

**Why these last:**
- Potentially less documented
- Lower priority research

---

## Time Investment Estimate

- **Session 1 (test):** 30-40 min
- **Sessions 2-6:** 7.5-10.5 hours
- **Total:** ~8-11 hours

**Per location average:** 20-25 minutes

---

## Acceptance Criteria for Data

### ✅ Minimum Viable (acceptable for any location)
```json
{
  "name": "BarName",
  "website_url": "https://instagram.com/barname",
  "address": "Vitosha Blvd 34"
}
```

### ⚠️ Good Quality (expected for most)
```json
{
  "name": "BarName",
  "website_url": "https://instagram.com/barname",
  "address": "Vitosha Blvd 34",
  "opening_hours": "Mo-Fr 18:00-02:00",
  "payment_methods": ["cash", "card", "revolut"],
  "beer_menu": [{"name": "IPA", "price": "5€"}]
}
```

### 🌟 Excellent (best-case scenario)
```json
{
  "name": "BarName",
  "website_url": "https://instagram.com/barname",
  "address": "Vitosha Blvd 34",
  "opening_hours": "Mo-Fr 18:00-02:00",
  "payment_methods": ["cash", "card", "revolut"],
  "beer_menu": [{"name": "IPA", "price": "5€"}],
  "music_type": "Jazz, Rock",
  "crowd_type": "Locals, Mixed",
  "seating_options": ["indoor", "terrace"],
  "pro_tips": "Ask for secret menu",
  "fun_facts": "Oldest bar in Sofia"
}
```

---

## Research Tracking Template

```
Location: [NAME]
Status: [✅ Complete / ⚠️ Partial / ❌ Missing]

Found:
- URL: [link]
- Address: [text]
- Hours: [text]
- Payment: [array]
- Beer: [JSON]
- Music: [text]
- Crowd: [text]
- Seating: [array]
- Pro Tips: [text]
- Fun Fact: [text]

Sources: [list of sources used]
Notes: [observations, challenges]
```

---

## Progress Tracking

| # | Location | Status | Date |
|---|----------|--------|------|
| 1 | Tap Local | ✅ Complete | 2026-04-23 |
| 2 | KANAAL | ⏳ Pending |
| 3 | BiraBar | ⏳ Pending |
| 4 | The Hop Bar | ⏳ Pending |
| 5 | Brick Bar | ⏳ Pending |
| 6 | Sputnik Cocktail Bar | ⏳ Pending |
| 7 | Bar Locál | ⏳ Pending |
| 8 | Bar Secret Room | ⏳ Pending |
| 9 | Fabric 123 | ⏳ Pending |
| 10 | Bar 103 | ⏳ Pending |
| 11 | Eddie Sicoy Bar | ⏳ Pending |
| 12 | Raketa Rakia Bar | ⏳ Pending |
| 13 | Caldo Whiskey & Friends | ⏳ Pending |
| 14 | Sip'n Bite Wine Spot | ⏳ Pending |
| 15 | La Cave du Moulin | ⏳ Pending |
| 16 | Hambara | ⏳ Pending |
| 17 | Rock'nRolla | ⏳ Pending |
| 18 | One More Park Bar | ⏳ Pending |
| 19 | Cheveremetza 10 | ⏳ Pending |
| 20 | Vino & Grazhdanka | ⏳ Pending |
| 21 | Beer University | ⏳ Pending |
| 22 | Halbite (Tri ushi) | ⏳ Pending |
| 23 | Halbite Beer Hall | ⏳ Pending |
| 24 | Zelka Bar | ⏳ Pending |
| 25 | The Apartment | ⏳ Pending |
| 26 | Bunker Bar | ⏳ Pending |

---

## Notes

- All beer prices should be in € (Bulgarian Lev since January 2025)
- Payment methods limited to: cash, card, revolut
- JSON format must be valid for beer_menu, seating_options, payment_methods
- Hours format free text, keep consistent where possible
