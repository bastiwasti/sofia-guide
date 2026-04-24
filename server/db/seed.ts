import type Database from 'better-sqlite3'
import { getDatabase } from './index'
import { categories, locations } from './seed-data'
import { events, SeedEvent } from './events-seed'

function ensureEventVenueExtras(db: Database.Database): void {
  const venueRows: Array<[number, string, string, number, number]> = [
    [7, 'Sofia Opera and Ballet', 'Hauptbühne · klassische Oper, Ballett, Wagner-Festival', 42.6983, 23.3294],
    [7, 'Vidas Art Arena', 'Velodrome Serdika · Open-Air-Konzerte im Borisova-Park', 42.6817, 23.3398],
  ]
  const insertLoc = db.prepare(
    'INSERT OR IGNORE INTO locations (category_id, name, meta, rating, price_range, lat, lng) VALUES (?, ?, ?, NULL, NULL, ?, ?)'
  )
  for (const [catId, name, meta, lat, lng] of venueRows) {
    insertLoc.run(catId, name, meta, lat, lng)
  }
}

export function seedDatabase(force = false): void {
  const db = getDatabase()

  try {
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
    const locationCount = db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number }
    const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number }

    const needsBaseSeed = categoryCount.count === 0 || locationCount.count === 0 || force

    if (force) {
      console.log('Force re-seeding: clearing existing data...')
      db.prepare('DELETE FROM locations').run()
      db.prepare('DELETE FROM categories').run()
      db.prepare('DELETE FROM events').run()
    }

    // Seed all categories first (including event venue extras)
    console.log('Seeding categories...')
    const insertCategory = db.prepare(`
      INSERT OR REPLACE INTO categories (id, name, color, icon)
      VALUES (@id, @name, @color, @icon)
    `)

    for (const cat of categories) {
      insertCategory.run({ id: cat.id, name: cat.name, color: cat.color, icon: cat.icon })
    }
    insertCategory.run({ id: 7, name: 'Kultur & Bühne', color: '#6A4C93', icon: 'culture' })
    insertCategory.run({ id: 8, name: 'Sport & Stadion', color: '#2E7D32', icon: 'sport' })
    console.log(`Seeded ${categories.length} base categories + 2 event venue categories`)

    if (needsBaseSeed || !force) {
      const insertLocation = db.prepare(`
        INSERT OR IGNORE INTO locations (
          category_id, name, meta, rating, price_range, lat, lng,
          website_url, address, opening_hours, payment_methods, phone,
          beer_menu, cocktails_menu, food_menu, local_specialties,
          music_type, crowd_type, seating_options, pro_tips, fun_facts,
          entry_fee, visit_duration, best_time_to_visit, photo_allowed, guided_tours, key_features, dress_code, service_times,
          description
        )
        VALUES (
          @category_id, @name, @meta, @rating, @price_range, @lat, @lng,
          @website_url, @address, @opening_hours, @payment_methods, @phone,
          @beer_menu, @cocktails_menu, @food_menu, @local_specialties,
          @music_type, @crowd_type, @seating_options, @pro_tips, @fun_facts,
          @entry_fee, @visit_duration, @best_time_to_visit, @photo_allowed, @guided_tours, @key_features, @dress_code, @service_times,
          @description
        )
      `)

      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i]
        try {
          insertLocation.run({
            category_id: loc.category_id,
            name: loc.name,
            meta: loc.meta,
            rating: loc.rating,
            price_range: loc.price_range,
            lat: loc.lat,
            lng: loc.lng,
            website_url: loc.website_url ?? null,
            address: loc.address ?? null,
            opening_hours: loc.opening_hours ?? null,
            payment_methods: loc.payment_methods ?? null,
            phone: loc.phone ?? null,
            beer_menu: loc.beer_menu ?? null,
            cocktails_menu: loc.cocktails_menu ?? null,
            food_menu: loc.food_menu ?? null,
            local_specialties: (loc as any).local_specialties ?? null,
            music_type: loc.music_type ?? null,
            crowd_type: loc.crowd_type ?? null,
            seating_options: loc.seating_options ?? null,
            pro_tips: loc.pro_tips ?? null,
            fun_facts: loc.fun_facts ?? null,
            entry_fee: (loc as any).entry_fee ?? null,
            visit_duration: (loc as any).visit_duration ?? null,
            best_time_to_visit: (loc as any).best_time_to_visit ?? null,
            photo_allowed: (loc as any).photo_allowed ?? null,
            guided_tours: (loc as any).guided_tours ?? null,
            key_features: (loc as any).key_features ?? null,
            dress_code: (loc as any).dress_code ?? null,
            service_times: (loc as any).service_times ?? null,
            description: (loc as any).description ?? null
          })
          console.log(`Inserted ${i + 1}/${locations.length}: ${loc.name}`)
        } catch (err: any) {
          console.error(`Failed to insert location ${i + 1}/${locations.length}: ${loc.name} (category_id: ${loc.category_id})`)
          throw err
        }
      }
      console.log(`Seeded ${locations.length} locations`)
    }

    ensureEventVenueExtras(db)

    if (eventCount.count === 0 || force) {
      if (force && eventCount.count > 0) {
        console.log('Clearing events for re-seeding...')
        db.prepare('DELETE FROM events').run()
      }

      const findLocation = db.prepare('SELECT id FROM locations WHERE name = ?')

      const insertEvent = db.prepare(`
        INSERT OR IGNORE INTO events (
          title, event_type, location_id,
          venue_name, venue_address, venue_lat, venue_lng,
          start_date, end_date, start_time, end_time,
          recurrence, recurrence_until,
          price, external_url, description, emoji
        )
        VALUES (
          @title, @event_type, @location_id,
          @venue_name, @venue_address, @venue_lat, @venue_lng,
          @start_date, @end_date, @start_time, @end_time,
          @recurrence, @recurrence_until,
          @price, @external_url, @description, @emoji
        )
      `)

      const insertManyEvents = db.transaction((evts: SeedEvent[]) => {
        for (const evt of evts) {
          const lookup = evt.venue_lookup_name ?? evt.venue_name ?? null
          const resolved = lookup ? (findLocation.get(lookup) as { id: number } | undefined) : undefined
          insertEvent.run({
            title: evt.title,
            event_type: evt.event_type,
            location_id: resolved?.id ?? null,
            venue_name: evt.venue_name ?? null,
            venue_address: evt.venue_address ?? null,
            venue_lat: evt.venue_lat ?? null,
            venue_lng: evt.venue_lng ?? null,
            start_date: evt.start_date ?? null,
            end_date: evt.end_date ?? null,
            start_time: evt.start_time ?? null,
            end_time: evt.end_time ?? null,
            recurrence: evt.recurrence ?? null,
            recurrence_until: evt.recurrence_until ?? null,
            price: evt.price ?? null,
            external_url: evt.external_url ?? null,
            description: evt.description ?? null,
            emoji: evt.emoji ?? null,
          })
        }
      })

      insertManyEvents(events)
      console.log(`Seeded ${events.length} events`)
    }
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    db.close()
  }
}
