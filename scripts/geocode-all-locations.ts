import { writeFileSync } from 'fs'
import { locations } from '../server/db/seed-data'

async function geocodeWithRetry(name: string, maxRetries = 3): Promise<{ lat: number; lng: number } | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const searchQuery = `${name}, Sofia, Bulgaria`
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Sofia-Guide-App'
        }
      })

      if (!response.ok) {
        console.warn(`  Attempt ${attempt}/${maxRetries}: HTTP ${response.status}`)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        return null
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        console.warn(`  No results found`)
        return null
      }

      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      }
    } catch (error) {
      console.warn(`  Attempt ${attempt}/${maxRetries}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        continue
      }
      return null
    }
  }
  return null
}

async function updateAllLocations() {
  console.log('🗺️ Starting geocoding for all 43 locations...')
  console.log('⏱️ This will take about 45 seconds due to API rate limits...\n')

  const updatedLocations = []

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i]
    console.log(`[${i + 1}/${locations.length}] 📍 ${location.name}`)

    const coords = await geocodeWithRetry(location.name)

    if (coords) {
      console.log(`  ✅ ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`)
      updatedLocations.push({
        ...location,
        lat: coords.lat,
        lng: coords.lng
      })
    } else {
      console.log(`  ⚠️  Using original coordinates`)
      updatedLocations.push(location)
    }

    // Rate limiting - 1 second between requests
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('\n✅ All locations processed!')

  // Generate the updated seed-data.ts file
  const categories = [
    { id: 1, name: "Sehenswürdigkeiten", color: "#C2185B", icon: "sight" },
    { id: 2, name: "Restaurants",        color: "#3B6D11", icon: "food"  },
    { id: 3, name: "Kneipen & Bars",     color: "#9B2915", icon: "bar"   },
    { id: 4, name: "Craft Beer",         color: "#185FA5", icon: "beer"  },
    { id: 5, name: "Nightlife",          color: "#2c2c2a", icon: "night" },
    { id: 6, name: "Hotel",              color: "#E5A038", icon: "hotel" },
  ]

  const outputFile = `// Seed data with accurate coordinates from OpenStreetMap
// Generated: ${new Date().toISOString()}

export const categories = ${JSON.stringify(categories, null, 2)}

export const locations = ${JSON.stringify(updatedLocations, null, 2)}
`

  writeFileSync('server/db/seed-data.ts', outputFile)
  console.log('✅ Updated seed-data.ts saved!')

  console.log('\n🔄 Next steps will be executed automatically:')
  console.log('1. Delete old database')
  console.log('2. Run migration')
  console.log('3. Restart servers')
}

updateAllLocations().catch(console.error)
