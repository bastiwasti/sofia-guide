import { Location } from '../../hooks/useLocations'

export function hasBasicInfo(location: Location): boolean {
  return !!(
    location.address || 
    location.opening_hours || 
    location.website_url || 
    location.phone ||
    location.payment_methods
  )
}

export function hasRestaurantFields(location: Location): boolean {
  return !!(location.food_menu || location.local_specialties)
}

export function hasKneipenFields(location: Location): boolean {
  return !!(
    location.beer_menu || location.cocktails_menu || location.food_menu ||
    location.music_type || location.crowd_type || location.seating_options ||
    location.pro_tips || location.fun_facts
  )
}

export function hasCraftBeerFields(location: Location): boolean {
  return !!(location.beer_menu || location.music_type || location.crowd_type || location.pro_tips)
}

export function hasSightFields(location: Location): boolean {
  return !!(
    location.entry_fee || location.visit_duration || location.best_time_to_visit ||
    location.photo_allowed || location.guided_tours || location.key_features ||
    location.dress_code || location.service_times || location.description
  )
}

export function hasNightlifeFields(location: Location): boolean {
  return !!(
    location.dress_code || location.service_times || location.music_type ||
    location.crowd_type || location.pro_tips
  )
}

export function hasAnyDetails(location: Location): boolean {
  return !!(
    hasBasicInfo(location) ||
    location.beer_menu || location.cocktails_menu || location.food_menu ||
    location.music_type || location.crowd_type || location.seating_options ||
    location.pro_tips || location.fun_facts || location.local_specialties ||
    location.entry_fee || location.visit_duration || location.best_time_to_visit ||
    location.photo_allowed || location.guided_tours || location.key_features ||
    location.dress_code || location.service_times ||
    location.meta || location.rating || location.price_range
  )
}

export function parseJSON<T>(jsonString: string | null | undefined): T[] {
  if (!jsonString) return []
  try {
    return JSON.parse(jsonString) as T[]
  } catch {
    return []
  }
}
