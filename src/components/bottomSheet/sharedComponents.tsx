import { ChevronUp, ChevronDown } from 'lucide-react'

interface SectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function Section({ title, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="section">
      <button className="section-header" onClick={onToggle}>
        <span className="section-title">{title}</span>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isExpanded && <div className="section-content">{children}</div>}
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: React.ReactNode
  link?: boolean
}

export function InfoRow({ label, value, link }: InfoRowProps) {
  return (
    <div className="info-row">
      <span className="label">{label}</span>
      {link ? (
        <a href={(value as string) || '#'} target="_blank" rel="noopener noreferrer" className="value-link">
          {value}
        </a>
      ) : (
        <span className="value">{value}</span>
      )}
    </div>
  )
}

export function BeerItem({ name, brewery, style, price }: { name: string; brewery?: string; style?: string; price?: string }) {
  return (
    <div className="beer-item">
      <div className="beer-info">
        <span className="beer-name">{name}</span>
        {brewery && <span className="beer-brewery">{brewery}</span>}
        {style && <span className="beer-style">({style})</span>}
      </div>
      <span className="beer-price">{price}</span>
    </div>
  )
}

export function CocktailItem({ name, price, ingredients }: { name: string; price?: string; ingredients?: string }) {
  return (
    <div className="cocktail-item">
      <span className="cocktail-name">{name}</span>
      <span className="cocktail-price">{price}</span>
      {ingredients && <span className="cocktail-ingredients">{ingredients}</span>}
    </div>
  )
}

export function FoodItem({ name, price, description }: { name: string; price?: string; description?: string }) {
  return (
    <div className="food-item">
      <div className="food-info">
        <span className="food-name">{name}</span>
        <span className="food-price">{price}</span>
      </div>
      {description && <p className="food-description">{description}</p>}
    </div>
  )
}

export function ProTips({ content }: { content: string }) {
  return (
    <div className="pro-tips">
      <div className="pro-tips-header">💡 Pro Tip:</div>
      <p>{content}</p>
    </div>
  )
}

export function FunFacts({ content }: { content: string }) {
  return (
    <div className="fun-facts">
      <div className="fun-facts-header">📜 Fun Fact:</div>
      <p>{content}</p>
    </div>
  )
}
