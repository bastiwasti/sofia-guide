import { Category } from '../hooks/useCategories'

interface FilterBarProps {
  categories: Category[]
  selectedCategories: number[]
  onCategoryToggle: (categoryId: number) => void
}

export default function FilterBar({ categories, selectedCategories, onCategoryToggle }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-scroll">
        {categories.map(category => (
          <button
            key={category.id}
            className={`filter-chip ${selectedCategories.includes(category.id) ? 'active' : ''}`}
            onClick={() => onCategoryToggle(category.id)}
            style={{
              borderColor: category.color,
              backgroundColor: selectedCategories.includes(category.id) ? category.color : 'transparent',
              color: selectedCategories.includes(category.id) ? '#fff' : category.color
            }}
          >
            {category.name}
          </button>
        ))}
      </div>
      <style>{`
        .filter-bar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--color-white);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: var(--spacing-sm) 0;
        }

        .filter-scroll {
          display: flex;
          gap: var(--spacing-sm);
          overflow-x: auto;
          padding: 0 var(--spacing-md);
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .filter-scroll::-webkit-scrollbar {
          display: none;
        }

        .filter-chip {
          flex-shrink: 0;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          border-width: 2px;
          border-style: solid;
          background: transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .filter-chip:active {
          transform: scale(0.95);
        }

        .filter-chip.active {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  )
}
