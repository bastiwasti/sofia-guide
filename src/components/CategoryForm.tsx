import { useState } from 'react'
import { X } from 'lucide-react'

interface CategoryFormProps {
  onSave: (category: { name: string; color: string; icon: string }) => Promise<void>
  onCancel: () => void
}

const PRESET_COLORS = [
  '#C2185B', '#3B6D11', '#9B2915', '#185FA5', '#2c2c2a', '#E5A038',
  '#7B1FA2', '#D32F2F', '#1976D2', '#388E3C', '#F57C00', '#5D4037'
]

const PRESET_ICONS = ['sight', 'food', 'bar', 'beer', 'night', 'hotel', 'coffee', 'shop', 'park', 'museum']

export default function CategoryForm({ onSave, onCancel }: CategoryFormProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon, setIcon] = useState(PRESET_ICONS[0])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        color,
        icon
      })
    } catch (error) {
      console.error('Failed to save category:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="category-form-overlay">
      <div className="category-form">
        <div className="form-header">
          <h2>Neue Kategorie</h2>
          <button className="close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Cafés"
              required
            />
          </div>

          <div className="form-group">
            <label>Farbe</label>
            <div className="color-picker">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="icon-picker">
              {PRESET_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  className={`icon-option ${icon === i ? 'active' : ''}`}
                  onClick={() => setIcon(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="preview">
            <div
              className="preview-badge"
              style={{ backgroundColor: color }}
            >
              {icon} {name || 'Vorschau'}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Abbrechen
            </button>
            <button type="submit" className="save-btn" disabled={saving || !name.trim()}>
              {saving ? 'Speichert...' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .category-form-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 4000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .category-form {
          width: 90%;
          max-width: 400px;
          background: var(--color-white);
          border-radius: var(--border-radius-lg);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          animation: scaleIn 0.3s ease;
          overflow: hidden;
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--color-gray-light);
        }

        .form-header h2 {
          font-size: 18px;
          margin: 0;
        }

        .close-button {
          background: transparent;
          color: var(--color-gray-medium);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:active {
          background: var(--color-gray-light);
        }

        .category-form form {
          padding: var(--spacing-md);
        }

        .form-group {
          margin-bottom: var(--spacing-md);
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-gray-dark);
          margin-bottom: 8px;
        }

        .color-picker {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .color-option {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-option.active {
          border-color: var(--color-text);
          transform: scale(1.1);
        }

        .color-option:active {
          transform: scale(0.95);
        }

        .icon-picker {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .icon-option {
          padding: 8px;
          border: 1px solid var(--color-gray-light);
          background: var(--color-white);
          border-radius: var(--border-radius-sm);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-option.active {
          background: var(--color-craft);
          color: white;
          border-color: var(--color-craft);
        }

        .icon-option:active {
          transform: scale(0.95);
        }

        .preview {
          padding: var(--spacing-md);
          background: var(--color-gray-light);
          border-radius: var(--border-radius-sm);
          margin-bottom: var(--spacing-md);
        }

        .preview-badge {
          display: inline-block;
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .cancel-btn,
        .save-btn {
          flex: 1;
          padding: 12px;
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          font-size: 14px;
        }

        .cancel-btn {
          background: var(--color-gray-light);
          color: var(--color-text);
          border: none;
        }

        .save-btn {
          background: var(--color-craft);
          color: white;
          border: none;
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
