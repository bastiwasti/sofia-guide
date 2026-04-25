import { Location } from '../../hooks/useLocations'
import { parseJSON } from './CategoryHelpers'
import { Section, InfoRow, BeerItem, CocktailItem, FoodItem, ProTips, FunFacts } from './sharedComponents'
import { Info } from 'lucide-react'

interface CategoryRendererProps {
  location: Location
  expandedSections: Record<string, boolean>
  onToggleSection: (section: string) => void
  distance?: number
}

export function BasicInfoRenderer({ location, expandedSections, onToggleSection }: CategoryRendererProps) {
  const paymentMethods = parseJSON<string>(location.payment_methods)
  
  return (
    <Section
      title="📍 Basic Info"
      isExpanded={expandedSections.basicInfo}
      onToggle={() => onToggleSection('basicInfo')}
    >
      {location.address && <InfoRow label="📍 Adresse:" value={location.address || null} />}
      {location.opening_hours && <InfoRow label="🕐 Öffnungszeiten:" value={location.opening_hours || null} />}
      {location.website_url && <InfoRow label="🔗 Website:" value={location.website_url || null} link />}
      {location.phone && <InfoRow label="📞 Telefon:" value={location.phone || null} />}
      {paymentMethods.length > 0 && <InfoRow label="💳 Zahlung:" value={paymentMethods.join(', ')} />}
    </Section>
  )
}

export function MetaInfoRenderer({ location }: { location: Location }) {
  if (!location.meta) return null
  
  return (
    <div className="meta-section">
      <h3 className="meta-title">ℹ️ Info</h3>
      <p className="meta-content">{location.meta}</p>
    </div>
  )
}

export function RestaurantRenderer({ location, expandedSections, onToggleSection }: CategoryRendererProps) {
  const foodMenu = parseJSON<{name: string; price?: string; description?: string}>(location.food_menu)
  const beerMenu = parseJSON<{name: string; style?: string; price?: string; note?: string}>(location.beer_menu)
  const cocktailsMenu = parseJSON<{name: string; price?: string; ingredients?: string}>(location.cocktails_menu)
  const specialties = parseJSON<{name: string; description: string; price?: string}>(location.local_specialties)
  const seatingOptions = parseJSON<string>(location.seating_options)

  return (
    <>
      {foodMenu.length > 0 && (
        <Section
          title="🍽️ Essen"
          isExpanded={expandedSections.foodMenu}
          onToggle={() => onToggleSection('foodMenu')}
        >
          <div className="food-list">
            {foodMenu.map((food, index) => (
              <FoodItem key={index} name={food.name} price={food.price} description={food.description} />
            ))}
          </div>
        </Section>
      )}

      {specialties.length > 0 && (
        <Section
          title="🌟 Lokale Spezialitäten"
          isExpanded={expandedSections.localSpecialties}
          onToggle={() => onToggleSection('localSpecialties')}
        >
          <div className="specialties-list">
            {specialties.map((specialty, index) => (
              <div key={index} className="specialty-item">
                <div className="specialty-info">
                  <span className="specialty-name">{specialty.name}</span>
                  <span className="specialty-price">{specialty.price}</span>
                </div>
                <p className="specialty-description">{specialty.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {beerMenu.length > 0 && (
        <Section
          title="🍺 Biere"
          isExpanded={expandedSections.beerMenu}
          onToggle={() => onToggleSection('beerMenu')}
        >
          <div className="beer-list">
            {beerMenu.map((beer, index) => (
              <BeerItem key={index} name={beer.name} style={beer.style} price={beer.price} note={beer.note} />
            ))}
          </div>
        </Section>
      )}

      {cocktailsMenu.length > 0 && (
        <Section
          title="🍸 Cocktails"
          isExpanded={expandedSections.cocktailsMenu}
          onToggle={() => onToggleSection('cocktailsMenu')}
        >
          <div className="cocktail-list">
            {cocktailsMenu.map((cocktail, index) => (
              <CocktailItem key={index} name={cocktail.name} price={cocktail.price} ingredients={cocktail.ingredients} />
            ))}
          </div>
        </Section>
      )}

      {(location.music_type || location.crowd_type || seatingOptions.length > 0 || location.pro_tips) && (
        <Section
          title="🎵 Vibe"
          isExpanded={expandedSections.vibe}
          onToggle={() => onToggleSection('vibe')}
        >
          {location.music_type && <InfoRow label="🎵 Musik:" value={location.music_type} />}
          {location.crowd_type && <InfoRow label="👥 Crowd:" value={location.crowd_type} />}
          {seatingOptions.length > 0 && <InfoRow label="🪑 Sitzplätze:" value={seatingOptions.join(', ')} />}
          {location.pro_tips && <ProTips content={location.pro_tips} />}
        </Section>
      )}
    </>
  )
}

export function KneipenRenderer({ location, expandedSections, onToggleSection }: CategoryRendererProps) {
  const beerMenu = parseJSON<{name: string; style?: string; price?: string; note?: string}>(location.beer_menu)
  const cocktailsMenu = parseJSON<{name: string; price?: string; ingredients?: string}>(location.cocktails_menu)
  const foodMenu = parseJSON<{name: string; price?: string; description?: string}>(location.food_menu)
  const localSpecialties = parseJSON<{name: string; description?: string}>(location.local_specialties)
  const seatingOptions = parseJSON<string>(location.seating_options)

  return (
    <>
      {beerMenu.length > 0 && (
        <Section
          title="🍺 Beer Menu"
          isExpanded={expandedSections.beerMenu}
          onToggle={() => onToggleSection('beerMenu')}
        >
          <div className="beer-list">
            {beerMenu.map((beer, index) => (
              <BeerItem key={index} name={beer.name} style={beer.style} price={beer.price} note={beer.note} />
            ))}
          </div>
        </Section>
      )}

      {cocktailsMenu.length > 0 && (
        <Section
          title="🥃 Drinks"
          isExpanded={expandedSections.cocktailsMenu}
          onToggle={() => onToggleSection('cocktailsMenu')}
        >
          <div className="cocktail-list">
            {cocktailsMenu.map((cocktail, index) => (
              <CocktailItem key={index} name={cocktail.name} price={cocktail.price} ingredients={cocktail.ingredients} />
            ))}
          </div>
        </Section>
      )}

      {foodMenu.length > 0 && (
        <Section
          title="🍽️ Food"
          isExpanded={expandedSections.foodMenu}
          onToggle={() => onToggleSection('foodMenu')}
        >
          <div className="food-list">
            {foodMenu.map((food, index) => (
              <FoodItem key={index} name={food.name} price={food.price} description={food.description} />
            ))}
          </div>
        </Section>
      )}

      {localSpecialties.length > 0 && (
        <Section
          title="🌟 Lokale Spezialitäten"
          isExpanded={expandedSections.localSpecialties}
          onToggle={() => onToggleSection('localSpecialties')}
        >
          <div className="specialties-list">
            {localSpecialties.map((specialty, index) => (
              <div key={index} className="specialty-item">
                <div className="specialty-info">
                  <span className="specialty-name">{specialty.name}</span>
                </div>
                {specialty.description && <p className="specialty-description">{specialty.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {(location.music_type || location.crowd_type || seatingOptions.length > 0 || location.pro_tips || location.fun_facts) && (
        <Section
          title="🎵 Vibe"
          isExpanded={expandedSections.vibe}
          onToggle={() => onToggleSection('vibe')}
        >
          {location.music_type && <InfoRow label="🎵 Musik:" value={location.music_type} />}
          {location.crowd_type && <InfoRow label="👥 Crowd:" value={location.crowd_type} />}
          {seatingOptions.length > 0 && <InfoRow label="🪑 Sitzplätze:" value={seatingOptions.join(', ')} />}
          {location.pro_tips && <ProTips content={location.pro_tips} />}
          {location.fun_facts && <FunFacts content={location.fun_facts} />}
        </Section>
      )}
    </>
  )
}

export function SightRenderer({ location, expandedSections, onToggleSection, distance }: CategoryRendererProps) {
  const keyFeatures = parseJSON<string>(location.key_features)
  const guidedTours = parseJSON<string>(location.guided_tours)

  return (
    <>
      <div className="quick-facts-row">
        {location.entry_fee && (
          <div className="quick-fact-item">
            <span className="quick-fact-icon">💰</span>
            <div className="quick-fact-content">
              <span className="quick-fact-label">Eintritt</span>
              <span className="quick-fact-value">{location.entry_fee}</span>
            </div>
          </div>
        )}
        {location.visit_duration && (
          <div className="quick-fact-item">
            <span className="quick-fact-icon">⏱️</span>
            <div className="quick-fact-content">
              <span className="quick-fact-label">Dauer</span>
              <span className="quick-fact-value">{location.visit_duration}</span>
            </div>
          </div>
        )}
        {distance !== undefined && (
          <div className="quick-fact-item">
            <span className="quick-fact-icon">📍</span>
            <div className="quick-fact-content">
              <span className="quick-fact-label">Entfernung</span>
              <span className="quick-fact-value">{Math.round(distance)}m vom Hotel</span>
            </div>
          </div>
        )}
      </div>

      {keyFeatures.length > 0 && (
        <Section
          title="🏛️ Highlights"
          isExpanded={expandedSections.sightHighlights}
          onToggle={() => onToggleSection('sightHighlights')}
        >
          <div className="key-features-list">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="key-feature-item">
                <span className="key-feature-bullet">•</span>
                <span className="key-feature-text">{feature}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(location.best_time_to_visit || location.photo_allowed || location.dress_code || location.service_times || guidedTours.length > 0) && (
        <Section
          title="📋 Praktische Infos"
          isExpanded={expandedSections.sightPraktische}
          onToggle={() => onToggleSection('sightPraktische')}
        >
          {location.best_time_to_visit && <InfoRow label="🕐 Beste Zeit:" value={location.best_time_to_visit} />}
          {location.photo_allowed && <InfoRow label="📸 Fotos:" value={location.photo_allowed} />}
          {location.dress_code && <InfoRow label="👔 Dress Code:" value={location.dress_code} />}
          {location.service_times && <InfoRow label="🕐 Öffnungszeiten:" value={location.service_times} />}
          {guidedTours.length > 0 && <InfoRow label="🎯 Führungen:" value={guidedTours.join(', ')} />}
        </Section>
      )}
    </>
  )
}

export function NightlifeRenderer({ location, expandedSections, onToggleSection }: CategoryRendererProps) {
  return (
    <>
      {(location.dress_code || location.service_times || location.music_type || location.crowd_type || location.pro_tips) && (
        <Section
          title="🎉 Vibe & Regeln"
          isExpanded={expandedSections.nightlifeVibe}
          onToggle={() => onToggleSection('nightlifeVibe')}
        >
          {location.dress_code && <InfoRow label="👔 Dress Code:" value={location.dress_code} />}
          {location.service_times && <InfoRow label="🕐 Service:" value={location.service_times} />}
          {location.music_type && <InfoRow label="🎵 Musik:" value={location.music_type} />}
          {location.crowd_type && <InfoRow label="👥 Crowd:" value={location.crowd_type} />}
          {location.pro_tips && <ProTips content={location.pro_tips} />}
        </Section>
      )}
    </>
  )
}

export function EmptyStateRenderer() {
  return (
    <div className="no-details-hint">
      <Info size={32} />
      <p>Mehr Details folgen...</p>
    </div>
  )
}
