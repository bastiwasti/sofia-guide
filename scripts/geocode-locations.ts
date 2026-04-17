import { writeFileSync } from 'fs'
import { locations } from '../server/db/seed-data'

interface Location {
  category_id: number
  name: string
  meta: string
  rating: number | null
  price_range: string | null
  lat: number
  lng: number
}

async function geocodeLocation(location: Location): Promise<{ lat: number; lng: number } | null> {
  try {
    const searchQuery = `${location.name}, Sofia, Bulgaria`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Sofia-Guide-App'
      }
    })
    
    if (!response.ok) {
      console.error(`Failed to geocode: ${location.name}`)
      return null
    }
    
    const data = await response.json()
    
    if (!data || data.length === 0) {
      console.error(`No results for: ${location.name}`)
      return null
    }
    
    const result = data[0]
    console.log(`✓ ${location.name}: ${result.lat}, ${result.lon}`)
    
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    }
  } catch (error) {
    console.error(`Error geocoding ${location.name}:`, error)
    return null
  }
}

async function updateAllLocations() {
  console.log('Starting geocoding for all locations...')
  console.log('This may take a while due to API rate limits...\n')
  
  const updatedLocations = []
  
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i]
    console.log(`[${i + 1}/${locations.length}] Geocoding: ${location.name}`)
    
    const coords = await geocodeLocation(location)
    
    if (coords) {
      updatedLocations.push({
        ...location,
        lat: coords.lat,
        lng: coords.lng
      })
    } else {
      console.warn(`⚠ Using original coords for: ${location.name}`)
      updatedLocations.push(location)
    }
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n✅ All locations geocoded!')
  
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
  
  writeFileSync('server/db/seed-data-updated.ts', outputFile)
  console.log('✅ Updated seed data saved to: server/db/seed-data-updated.ts')
  console.log('\n📋 Next steps:')
  console.log('1. Review the updated coordinates')
  console.log('2. Replace server/db/seed-data.ts with the new file')
  console.log('3. Run: npm run db:migrate')
}

updateAllLocations().catch(console.error)
