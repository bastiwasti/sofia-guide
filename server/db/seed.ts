import { getDatabase } from './index'
import { categories, locations } from './seed-data'

export function seedDatabase(): void {
  const db = getDatabase()
  
  try {
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
    const locationCount = db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number }
    
    if (categoryCount.count > 0 && locationCount.count > 0) {
      console.log('Database already seeded')
      return
    }

    const insertCategory = db.prepare(`
      INSERT INTO categories (name, color, icon)
      VALUES (@name, @color, @icon)
    `)

    const insertLocation = db.prepare(`
      INSERT INTO locations (category_id, name, meta, rating, price_range, lat, lng)
      VALUES (@category_id, @name, @meta, @rating, @price_range, @lat, @lng)
    `)

    const insertManyCategories = db.transaction((cats: typeof categories) => {
      for (const cat of cats) {
        insertCategory.run(cat)
      }
    })

    const insertManyLocations = db.transaction((locs: typeof locations) => {
      for (const loc of locs) {
        insertLocation.run(loc)
      }
    })

    insertManyCategories(categories)
    insertManyLocations(locations)

    console.log(`Seeded ${categories.length} categories and ${locations.length} locations`)
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    db.close()
  }
}
